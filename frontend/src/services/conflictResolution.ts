import { Change, CollaborationUser } from './templateCollaboration';
import { ExportTemplate, TemplateSection } from './templateService';

export interface Conflict {
    id: string;
    timestamp: string;
    type: 'concurrent-edit' | 'lock-expired' | 'version-mismatch';
    users: CollaborationUser[];
    section: {
        id: string;
        path: string[];
    };
    changes: Change[];
    resolutions: Resolution[];
    status: 'pending' | 'resolved' | 'rejected';
    resolvedBy?: string;
    resolvedAt?: string;
}

export interface Resolution {
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    type: 'merge' | 'override' | 'revert';
    description: string;
    changes: Change[];
    votes: {
        userId: string;
        vote: 'approve' | 'reject';
        comment?: string;
    }[];
}

export interface MergeStrategy {
    type: 'auto' | 'manual';
    rules?: {
        priority: string[];
        preserveOrder: boolean;
        keepBoth: boolean;
    };
}

export class ConflictResolutionService {
    private static conflicts = new Map<string, Conflict[]>();
    private static listeners = new Map<string, Set<(conflicts: Conflict[]) => void>>();

    static async detectConflicts(
        templateId: string,
        changes: Change[],
        currentUser: CollaborationUser
    ): Promise<Conflict[]> {
        const conflicts: Conflict[] = [];
        const existingConflicts = this.conflicts.get(templateId) || [];

        // Group changes by section
        const changesBySection = this.groupChangesBySection(changes);

        for (const [sectionPath, sectionChanges] of changesBySection.entries()) {
            const concurrentChanges = this.findConcurrentChanges(
                templateId,
                sectionPath,
                sectionChanges,
                currentUser
            );

            if (concurrentChanges.length > 0) {
                conflicts.push({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    type: 'concurrent-edit',
                    users: [currentUser, ...concurrentChanges.map(c => ({
                        id: c.userId,
                        name: c.userName,
                        status: 'active',
                        lastActivity: c.timestamp
                    }))],
                    section: {
                        id: sectionPath.split('.').pop() || '',
                        path: sectionPath.split('.')
                    },
                    changes: [...sectionChanges, ...concurrentChanges],
                    resolutions: [],
                    status: 'pending'
                });
            }
        }

        if (conflicts.length > 0) {
            this.conflicts.set(templateId, [...existingConflicts, ...conflicts]);
            this.notifyListeners(templateId);
        }

        return conflicts;
    }

    static async proposeResolution(
        templateId: string,
        conflictId: string,
        resolution: Omit<Resolution, 'id' | 'timestamp' | 'votes'>
    ): Promise<Resolution> {
        const conflicts = this.conflicts.get(templateId);
        if (!conflicts) throw new Error('Template not found');

        const conflict = conflicts.find(c => c.id === conflictId);
        if (!conflict) throw new Error('Conflict not found');

        const newResolution: Resolution = {
            ...resolution,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            votes: []
        };

        conflict.resolutions.push(newResolution);
        this.notifyListeners(templateId);

        return newResolution;
    }

    static async voteOnResolution(
        templateId: string,
        conflictId: string,
        resolutionId: string,
        userId: string,
        vote: 'approve' | 'reject',
        comment?: string
    ): Promise<void> {
        const conflicts = this.conflicts.get(templateId);
        if (!conflicts) throw new Error('Template not found');

        const conflict = conflicts.find(c => c.id === conflictId);
        if (!conflict) throw new Error('Conflict not found');

        const resolution = conflict.resolutions.find(r => r.id === resolutionId);
        if (!resolution) throw new Error('Resolution not found');

        const existingVote = resolution.votes.find(v => v.userId === userId);
        if (existingVote) {
            existingVote.vote = vote;
            existingVote.comment = comment;
        } else {
            resolution.votes.push({ userId, vote, comment });
        }

        // Check if resolution is approved
        const approvalCount = resolution.votes.filter(v => v.vote === 'approve').length;
        if (approvalCount >= Math.ceil(conflict.users.length / 2)) {
            conflict.status = 'resolved';
            conflict.resolvedBy = userId;
            conflict.resolvedAt = new Date().toISOString();
        }

        this.notifyListeners(templateId);
    }

    static async applyResolution(
        templateId: string,
        conflictId: string,
        resolutionId: string
    ): Promise<Change[]> {
        const conflicts = this.conflicts.get(templateId);
        if (!conflicts) throw new Error('Template not found');

        const conflict = conflicts.find(c => c.id === conflictId);
        if (!conflict) throw new Error('Conflict not found');

        const resolution = conflict.resolutions.find(r => r.id === resolutionId);
        if (!resolution) throw new Error('Resolution not found');

        // Apply resolution changes
        return resolution.changes;
    }

    static async mergeChanges(
        changes: Change[],
        strategy: MergeStrategy
    ): Promise<Change[]> {
        if (strategy.type === 'auto') {
            return this.autoMergeChanges(changes, strategy.rules);
        }
        return changes;
    }

    static onConflictsChange(
        templateId: string,
        callback: (conflicts: Conflict[]) => void
    ): () => void {
        if (!this.listeners.has(templateId)) {
            this.listeners.set(templateId, new Set());
        }
        this.listeners.get(templateId)!.add(callback);
        return () => this.listeners.get(templateId)?.delete(callback);
    }

    private static groupChangesBySection(changes: Change[]): Map<string, Change[]> {
        const groups = new Map<string, Change[]>();
        changes.forEach(change => {
            const sectionPath = change.path.join('.');
            if (!groups.has(sectionPath)) {
                groups.set(sectionPath, []);
            }
            groups.get(sectionPath)!.push(change);
        });
        return groups;
    }

    private static findConcurrentChanges(
        templateId: string,
        sectionPath: string,
        changes: Change[],
        currentUser: CollaborationUser
    ): Change[] {
        const conflicts = this.conflicts.get(templateId) || [];
        const concurrentChanges: Change[] = [];

        changes.forEach(change => {
            const timestamp = new Date(change.timestamp);
            const recentChanges = conflicts
                .filter(c => c.section.path.join('.') === sectionPath)
                .flatMap(c => c.changes)
                .filter(c => 
                    c.userId !== currentUser.id &&
                    Math.abs(new Date(c.timestamp).getTime() - timestamp.getTime()) < 5000 // 5 seconds threshold
                );
            concurrentChanges.push(...recentChanges);
        });

        return concurrentChanges;
    }

    private static autoMergeChanges(
        changes: Change[],
        rules?: MergeStrategy['rules']
    ): Change[] {
        if (!rules) return changes;

        const mergedChanges = [...changes];

        if (rules.priority.length > 0) {
            mergedChanges.sort((a, b) => {
                const priorityA = rules.priority.indexOf(a.userId);
                const priorityB = rules.priority.indexOf(b.userId);
                return priorityA - priorityB;
            });
        }

        if (rules.preserveOrder) {
            mergedChanges.sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
        }

        if (!rules.keepBoth) {
            // Remove duplicate changes on same path
            const uniqueChanges = new Map<string, Change>();
            mergedChanges.forEach(change => {
                const path = change.path.join('.');
                uniqueChanges.set(path, change);
            });
            return Array.from(uniqueChanges.values());
        }

        return mergedChanges;
    }

    private static notifyListeners(templateId: string): void {
        const conflicts = this.conflicts.get(templateId) || [];
        this.listeners.get(templateId)?.forEach(listener => {
            listener(conflicts);
        });
    }
}