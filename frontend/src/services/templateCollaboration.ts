import { ExportTemplate } from './templateService';
import { wsService } from './websocket';

export interface CollaborationUser {
    id: string;
    name: string;
    avatar?: string;
    status: 'active' | 'idle' | 'offline';
    cursor?: {
        section: number;
        position: number;
    };
    lastActivity: string;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: string;
    sectionId?: string;
    resolved?: boolean;
    replies?: Comment[];
    reactions?: {
        [key: string]: string[]; // emoji -> userIds
    };
}

export interface Change {
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    type: 'add' | 'update' | 'delete';
    path: string[];
    value?: any;
    previousValue?: any;
}

export interface CollaborationSession {
    templateId: string;
    users: CollaborationUser[];
    comments: Comment[];
    changes: Change[];
    locks: {
        [sectionId: string]: {
            userId: string;
            acquired: string;
            expires: string;
        };
    };
}

export class TemplateCollaborationService {
    private static sessions = new Map<string, CollaborationSession>();
    private static changeListeners = new Map<string, Set<(change: Change) => void>>();
    private static commentListeners = new Map<string, Set<(comment: Comment) => void>>();
    private static presenceListeners = new Map<string, Set<(users: CollaborationUser[]) => void>>();

    static async joinSession(templateId: string, user: Omit<CollaborationUser, 'lastActivity'>): Promise<CollaborationSession> {
        let session = this.sessions.get(templateId);
        
        if (!session) {
            session = {
                templateId,
                users: [],
                comments: [],
                changes: [],
                locks: {}
            };
            this.sessions.set(templateId, session);
        }

        const existingUser = session.users.find(u => u.id === user.id);
        if (existingUser) {
            existingUser.status = 'active';
            existingUser.lastActivity = new Date().toISOString();
        } else {
            session.users.push({
                ...user,
                status: 'active',
                lastActivity: new Date().toISOString()
            });
        }

        wsService['socket']?.emit('template:join', {
            templateId,
            userId: user.id
        });

        this.notifyPresenceChange(templateId);
        return session;
    }

    static async leaveSession(templateId: string, userId: string): Promise<void> {
        const session = this.sessions.get(templateId);
        if (!session) return;

        session.users = session.users.filter(u => u.id !== userId);
        this.releaseLocks(templateId, userId);

        wsService['socket']?.emit('template:leave', {
            templateId,
            userId
        });

        this.notifyPresenceChange(templateId);
    }

    static async addComment(
        templateId: string,
        comment: Omit<Comment, 'id' | 'timestamp'>
    ): Promise<Comment> {
        const session = this.getSession(templateId);
        const newComment: Comment = {
            ...comment,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };

        session.comments.push(newComment);
        this.notifyCommentAdded(templateId, newComment);

        wsService['socket']?.emit('template:comment', {
            templateId,
            comment: newComment
        });

        return newComment;
    }

    static async resolveComment(templateId: string, commentId: string): Promise<void> {
        const session = this.getSession(templateId);
        const comment = session.comments.find(c => c.id === commentId);
        if (comment) {
            comment.resolved = true;
            this.notifyCommentUpdated(templateId, comment);
        }
    }

    static async addReaction(
        templateId: string,
        commentId: string,
        userId: string,
        emoji: string
    ): Promise<void> {
        const session = this.getSession(templateId);
        const comment = session.comments.find(c => c.id === commentId);
        if (comment) {
            if (!comment.reactions) {
                comment.reactions = {};
            }
            if (!comment.reactions[emoji]) {
                comment.reactions[emoji] = [];
            }
            if (!comment.reactions[emoji].includes(userId)) {
                comment.reactions[emoji].push(userId);
            }
            this.notifyCommentUpdated(templateId, comment);
        }
    }

    static async recordChange(
        templateId: string,
        change: Omit<Change, 'id' | 'timestamp'>
    ): Promise<Change> {
        const session = this.getSession(templateId);
        const newChange: Change = {
            ...change,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };

        session.changes.push(newChange);
        this.notifyChangeRecorded(templateId, newChange);

        wsService['socket']?.emit('template:change', {
            templateId,
            change: newChange
        });

        return newChange;
    }

    static async acquireLock(
        templateId: string,
        sectionId: string,
        userId: string,
        duration: number = 30000 // 30 seconds
    ): Promise<boolean> {
        const session = this.getSession(templateId);
        const now = new Date();
        const expires = new Date(now.getTime() + duration);

        // Check if section is already locked
        const existingLock = session.locks[sectionId];
        if (existingLock) {
            const lockExpiry = new Date(existingLock.expires);
            if (lockExpiry > now && existingLock.userId !== userId) {
                return false;
            }
        }

        session.locks[sectionId] = {
            userId,
            acquired: now.toISOString(),
            expires: expires.toISOString()
        };

        wsService['socket']?.emit('template:lock', {
            templateId,
            sectionId,
            userId,
            expires: expires.toISOString()
        });

        return true;
    }

    static async releaseLock(templateId: string, sectionId: string, userId: string): Promise<void> {
        const session = this.getSession(templateId);
        const lock = session.locks[sectionId];
        if (lock && lock.userId === userId) {
            delete session.locks[sectionId];

            wsService['socket']?.emit('template:unlock', {
                templateId,
                sectionId,
                userId
            });
        }
    }

    static async updateCursor(
        templateId: string,
        userId: string,
        cursor: CollaborationUser['cursor']
    ): Promise<void> {
        const session = this.getSession(templateId);
        const user = session.users.find(u => u.id === userId);
        if (user) {
            user.cursor = cursor;
            user.lastActivity = new Date().toISOString();
            this.notifyPresenceChange(templateId);
        }
    }

    static onPresenceChange(
        templateId: string,
        callback: (users: CollaborationUser[]) => void
    ): () => void {
        if (!this.presenceListeners.has(templateId)) {
            this.presenceListeners.set(templateId, new Set());
        }
        this.presenceListeners.get(templateId)!.add(callback);
        return () => this.presenceListeners.get(templateId)?.delete(callback);
    }

    static onCommentAdded(
        templateId: string,
        callback: (comment: Comment) => void
    ): () => void {
        if (!this.commentListeners.has(templateId)) {
            this.commentListeners.set(templateId, new Set());
        }
        this.commentListeners.get(templateId)!.add(callback);
        return () => this.commentListeners.get(templateId)?.delete(callback);
    }

    static onChangeRecorded(
        templateId: string,
        callback: (change: Change) => void
    ): () => void {
        if (!this.changeListeners.has(templateId)) {
            this.changeListeners.set(templateId, new Set());
        }
        this.changeListeners.get(templateId)!.add(callback);
        return () => this.changeListeners.get(templateId)?.delete(callback);
    }

    private static getSession(templateId: string): CollaborationSession {
        const session = this.sessions.get(templateId);
        if (!session) {
            throw new Error(`No active session for template ${templateId}`);
        }
        return session;
    }

    private static releaseLocks(templateId: string, userId: string): void {
        const session = this.sessions.get(templateId);
        if (!session) return;

        Object.entries(session.locks).forEach(([sectionId, lock]) => {
            if (lock.userId === userId) {
                delete session.locks[sectionId];
            }
        });
    }

    private static notifyPresenceChange(templateId: string): void {
        const session = this.sessions.get(templateId);
        if (!session) return;

        this.presenceListeners.get(templateId)?.forEach(listener => {
            listener(session.users);
        });
    }

    private static notifyCommentAdded(templateId: string, comment: Comment): void {
        this.commentListeners.get(templateId)?.forEach(listener => {
            listener(comment);
        });
    }

    private static notifyCommentUpdated(templateId: string, comment: Comment): void {
        this.commentListeners.get(templateId)?.forEach(listener => {
            listener(comment);
        });
    }

    private static notifyChangeRecorded(templateId: string, change: Change): void {
        this.changeListeners.get(templateId)?.forEach(listener => {
            listener(change);
        });
    }
}