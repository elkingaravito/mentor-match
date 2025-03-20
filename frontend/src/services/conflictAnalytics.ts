import { Conflict, Resolution } from './conflictResolution';
import { Change } from './templateCollaboration';

export interface ConflictMetrics {
    total: number;
    resolved: number;
    rejected: number;
    pending: number;
    averageResolutionTime: number;
    resolutionTypes: {
        [key in Resolution['type']]: number;
    };
    hotspots: {
        section: string;
        conflicts: number;
        lastConflict: string;
    }[];
    userImpact: {
        userId: string;
        userName: string;
        conflictsInvolved: number;
        resolutionsProposed: number;
        resolutionsAccepted: number;
        averageApprovalRate: number;
    }[];
    timeDistribution: {
        hour: number;
        conflicts: number;
    }[];
}

export interface ConflictPrediction {
    risk: 'low' | 'medium' | 'high';
    probability: number;
    factors: {
        type: string;
        impact: number;
        description: string;
    }[];
    recommendations: string[];
}

export class ConflictAnalyticsService {
    static async analyzeConflicts(
        conflicts: Conflict[],
        timeRange?: { start: Date; end: Date }
    ): Promise<ConflictMetrics> {
        let filteredConflicts = conflicts;
        if (timeRange) {
            filteredConflicts = conflicts.filter(c => {
                const timestamp = new Date(c.timestamp);
                return timestamp >= timeRange.start && timestamp <= timeRange.end;
            });
        }

        const metrics: ConflictMetrics = {
            total: filteredConflicts.length,
            resolved: filteredConflicts.filter(c => c.status === 'resolved').length,
            rejected: filteredConflicts.filter(c => c.status === 'rejected').length,
            pending: filteredConflicts.filter(c => c.status === 'pending').length,
            averageResolutionTime: this.calculateAverageResolutionTime(filteredConflicts),
            resolutionTypes: this.countResolutionTypes(filteredConflicts),
            hotspots: this.identifyHotspots(filteredConflicts),
            userImpact: this.analyzeUserImpact(filteredConflicts),
            timeDistribution: this.analyzeTimeDistribution(filteredConflicts)
        };

        return metrics;
    }

    static async predictConflicts(
        templateId: string,
        changes: Change[],
        activeUsers: { id: string; section: string }[]
    ): Promise<ConflictPrediction> {
        const prediction: ConflictPrediction = {
            risk: 'low',
            probability: 0,
            factors: [],
            recommendations: []
        };

        // Analyze concurrent edits
        const concurrentEdits = this.analyzeConcurrentEdits(changes, activeUsers);
        if (concurrentEdits.length > 0) {
            prediction.factors.push({
                type: 'concurrent_edits',
                impact: 0.8,
                description: `${concurrentEdits.length} users editing the same sections`
            });
            prediction.recommendations.push(
                'Consider implementing section locking',
                'Notify users about concurrent editors'
            );
        }

        // Analyze edit patterns
        const riskPatterns = this.analyzeRiskPatterns(changes);
        prediction.factors.push(...riskPatterns.factors);
        prediction.recommendations.push(...riskPatterns.recommendations);

        // Calculate overall risk
        const riskScore = prediction.factors.reduce((sum, factor) => sum + factor.impact, 0);
        prediction.probability = Math.min(riskScore / prediction.factors.length, 1);
        prediction.risk = this.calculateRiskLevel(prediction.probability);

        return prediction;
    }

    static async suggestPreventiveMeasures(
        conflicts: Conflict[],
        changes: Change[]
    ): Promise<string[]> {
        const measures = new Set<string>();

        // Analyze conflict patterns
        const patterns = this.analyzeConflictPatterns(conflicts);
        patterns.forEach(pattern => {
            switch (pattern.type) {
                case 'concurrent_edits':
                    measures.add('Implement real-time section locking');
                    measures.add('Add visual indicators for active editors');
                    break;
                case 'version_mismatch':
                    measures.add('Enforce version check before saves');
                    measures.add('Add automatic version merging');
                    break;
                case 'communication_gap':
                    measures.add('Enable in-line comments and discussions');
                    measures.add('Add change intention indicators');
                    break;
            }
        });

        // Analyze user behavior
        const userPatterns = this.analyzeUserBehavior(changes);
        userPatterns.forEach(pattern => {
            switch (pattern.type) {
                case 'rapid_changes':
                    measures.add('Add cool-down period between changes');
                    measures.add('Implement change batching');
                    break;
                case 'overlapping_edits':
                    measures.add('Show user activity heatmap');
                    measures.add('Implement section reservation system');
                    break;
            }
        });

        return Array.from(measures);
    }

    private static calculateAverageResolutionTime(conflicts: Conflict[]): number {
        const resolvedConflicts = conflicts.filter(c => 
            c.status === 'resolved' && c.resolvedAt
        );

        if (resolvedConflicts.length === 0) return 0;

        const totalTime = resolvedConflicts.reduce((sum, conflict) => {
            const start = new Date(conflict.timestamp);
            const end = new Date(conflict.resolvedAt!);
            return sum + (end.getTime() - start.getTime());
        }, 0);

        return totalTime / resolvedConflicts.length;
    }

    private static countResolutionTypes(conflicts: Conflict[]): ConflictMetrics['resolutionTypes'] {
        const counts = {
            merge: 0,
            override: 0,
            revert: 0
        };

        conflicts.forEach(conflict => {
            conflict.resolutions.forEach(resolution => {
                counts[resolution.type]++;
            });
        });

        return counts;
    }

    private static identifyHotspots(conflicts: Conflict[]): ConflictMetrics['hotspots'] {
        const sectionCounts = new Map<string, { count: number; last: string }>();

        conflicts.forEach(conflict => {
            const section = conflict.section.path.join('.');
            const current = sectionCounts.get(section) || { count: 0, last: conflict.timestamp };
            sectionCounts.set(section, {
                count: current.count + 1,
                last: conflict.timestamp > current.last ? conflict.timestamp : current.last
            });
        });

        return Array.from(sectionCounts.entries())
            .map(([section, data]) => ({
                section,
                conflicts: data.count,
                lastConflict: data.last
            }))
            .sort((a, b) => b.conflicts - a.conflicts);
    }

    private static analyzeUserImpact(conflicts: Conflict[]): ConflictMetrics['userImpact'] {
        const userStats = new Map<string, {
            name: string;
            involved: number;
            proposed: number;
            accepted: number;
        }>();

        conflicts.forEach(conflict => {
            conflict.users.forEach(user => {
                const stats = userStats.get(user.id) || {
                    name: user.name,
                    involved: 0,
                    proposed: 0,
                    accepted: 0
                };
                stats.involved++;
                userStats.set(user.id, stats);
            });

            conflict.resolutions.forEach(resolution => {
                const stats = userStats.get(resolution.userId) || {
                    name: resolution.userName,
                    involved: 0,
                    proposed: 0,
                    accepted: 0
                };
                stats.proposed++;
                if (conflict.status === 'resolved' && conflict.resolvedBy === resolution.userId) {
                    stats.accepted++;
                }
                userStats.set(resolution.userId, stats);
            });
        });

        return Array.from(userStats.entries()).map(([userId, stats]) => ({
            userId,
            userName: stats.name,
            conflictsInvolved: stats.involved,
            resolutionsProposed: stats.proposed,
            resolutionsAccepted: stats.accepted,
            averageApprovalRate: stats.proposed > 0 ? stats.accepted / stats.proposed : 0
        }));
    }

    private static analyzeTimeDistribution(conflicts: Conflict[]): ConflictMetrics['timeDistribution'] {
        const hourCounts = new Array(24).fill(0);

        conflicts.forEach(conflict => {
            const hour = new Date(conflict.timestamp).getHours();
            hourCounts[hour]++;
        });

        return hourCounts.map((conflicts, hour) => ({ hour, conflicts }));
    }

    private static analyzeConcurrentEdits(
        changes: Change[],
        activeUsers: { id: string; section: string }[]
    ): { users: string[]; section: string }[] {
        const concurrentEdits: { users: string[]; section: string }[] = [];

        const sectionUsers = new Map<string, Set<string>>();
        activeUsers.forEach(user => {
            if (!sectionUsers.has(user.section)) {
                sectionUsers.set(user.section, new Set());
            }
            sectionUsers.get(user.section)!.add(user.id);
        });

        sectionUsers.forEach((users, section) => {
            if (users.size > 1) {
                concurrentEdits.push({
                    users: Array.from(users),
                    section
                });
            }
        });

        return concurrentEdits;
    }

    private static analyzeRiskPatterns(changes: Change[]): {
        factors: ConflictPrediction['factors'];
        recommendations: string[];
    } {
        const factors: ConflictPrediction['factors'] = [];
        const recommendations: string[] = [];

        // Analyze change frequency
        const changeFrequency = this.calculateChangeFrequency(changes);
        if (changeFrequency > 0.5) { // More than 1 change every 2 seconds
            factors.push({
                type: 'high_frequency',
                impact: 0.6,
                description: 'High frequency of changes detected'
            });
            recommendations.push('Consider implementing change throttling');
        }

        // Analyze change overlap
        const overlappingChanges = this.findOverlappingChanges(changes);
        if (overlappingChanges.length > 0) {
            factors.push({
                type: 'overlapping_changes',
                impact: 0.7,
                description: 'Multiple changes affecting the same sections'
            });
            recommendations.push('Implement section-based locking');
        }

        return { factors, recommendations };
    }

    private static calculateChangeFrequency(changes: Change[]): number {
        if (changes.length < 2) return 0;

        const timestamps = changes.map(c => new Date(c.timestamp).getTime());
        const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
        const averageInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

        return 1000 / averageInterval; // Changes per second
    }

    private static findOverlappingChanges(changes: Change[]): Change[][] {
        const overlapping: Change[][] = [];
        const changePaths = new Map<string, Change[]>();

        changes.forEach(change => {
            const path = change.path.join('.');
            if (!changePaths.has(path)) {
                changePaths.set(path, []);
            }
            changePaths.get(path)!.push(change);
        });

        changePaths.forEach(pathChanges => {
            if (pathChanges.length > 1) {
                overlapping.push(pathChanges);
            }
        });

        return overlapping;
    }

    private static calculateRiskLevel(probability: number): ConflictPrediction['risk'] {
        if (probability < 0.3) return 'low';
        if (probability < 0.7) return 'medium';
        return 'high';
    }

    private static analyzeConflictPatterns(conflicts: Conflict[]): Array<{
        type: string;
        frequency: number;
        impact: number;
    }> {
        const patterns: Array<{
            type: string;
            frequency: number;
            impact: number;
        }> = [];

        // Count conflict types
        const typeCount = conflicts.reduce((acc, conflict) => {
            acc[conflict.type] = (acc[conflict.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(typeCount).forEach(([type, count]) => {
            patterns.push({
                type,
                frequency: count / conflicts.length,
                impact: this.calculatePatternImpact(type, count)
            });
        });

        return patterns;
    }

    private static analyzeUserBehavior(changes: Change[]): Array<{
        type: string;
        frequency: number;
        users: string[];
    }> {
        const patterns: Array<{
            type: string;
            frequency: number;
            users: string[];
        }> = [];

        // Analyze rapid changes
        const rapidChanges = this.findRapidChanges(changes);
        if (rapidChanges.length > 0) {
            patterns.push({
                type: 'rapid_changes',
                frequency: rapidChanges.length / changes.length,
                users: Array.from(new Set(rapidChanges.map(c => c.userId)))
            });
        }

        // Analyze overlapping edits
        const overlappingEdits = this.findOverlappingEdits(changes);
        if (overlappingEdits.length > 0) {
            patterns.push({
                type: 'overlapping_edits',
                frequency: overlappingEdits.length / changes.length,
                users: Array.from(new Set(overlappingEdits.flatMap(group => 
                    group.map(c => c.userId)
                )))
            });
        }

        return patterns;
    }

    private static calculatePatternImpact(type: string, count: number): number {
        const baseImpact = {
            'concurrent-edit': 0.8,
            'lock-expired': 0.5,
            'version-mismatch': 0.7
        }[type] || 0.5;

        return Math.min(baseImpact * Math.log10(count + 1), 1);
    }

    private static findRapidChanges(changes: Change[]): Change[] {
        const RAPID_THRESHOLD = 1000; // 1 second
        return changes.filter((change, i) => {
            if (i === 0) return false;
            const prev = changes[i - 1];
            return (
                change.userId === prev.userId &&
                new Date(change.timestamp).getTime() - new Date(prev.timestamp).getTime() < RAPID_THRESHOLD
            );
        });
    }

    private static findOverlappingEdits(changes: Change[]): Change[][] {
        const OVERLAP_THRESHOLD = 5000; // 5 seconds
        const overlapping: Change[][] = [];
        const pathChanges = new Map<string, Change[]>();

        changes.forEach(change => {
            const path = change.path.join('.');
            if (!pathChanges.has(path)) {
                pathChanges.set(path, []);
            }
            const pathGroup = pathChanges.get(path)!;
            
            // Find overlapping changes
            const overlappingChanges = pathGroup.filter(existing =>
                Math.abs(
                    new Date(existing.timestamp).getTime() - 
                    new Date(change.timestamp).getTime()
                ) < OVERLAP_THRESHOLD &&
                existing.userId !== change.userId
            );

            if (overlappingChanges.length > 0) {
                overlapping.push([...overlappingChanges, change]);
            }

            pathGroup.push(change);
        });

        return overlapping;
    }
}