import { ConditionalRule } from '../components/analytics/ConditionalFormatting';
import { ResolutionStrategy } from './AutoResolutionService';
import { FixConflict } from './FixConflictService';

export interface ResolutionStep {
    id: string;
    timestamp: number;
    strategy: ResolutionStrategy;
    beforeState: ConditionalRule[];
    afterState: ConditionalRule[];
    resolvedConflicts: FixConflict[];
    remainingConflicts: FixConflict[];
    confidence: number;
    metadata: {
        rulesModified: number;
        rulesAdded: number;
        rulesRemoved: number;
        duration: number;  // milliseconds
    };
}

export interface ResolutionSession {
    id: string;
    startTime: number;
    endTime: number;
    steps: ResolutionStep[];
    finalState: ConditionalRule[];
    summary: {
        totalConflictsResolved: number;
        totalRulesModified: number;
        averageConfidence: number;
        successRate: number;
    };
}

export class ResolutionHistoryService {
    private static readonly LOCAL_STORAGE_KEY = 'resolution_history';
    private static readonly MAX_SESSIONS = 10;

    static startNewSession(): string {
        const sessionId = `session-${Date.now()}`;
        const session: ResolutionSession = {
            id: sessionId,
            startTime: Date.now(),
            endTime: 0,
            steps: [],
            finalState: [],
            summary: {
                totalConflictsResolved: 0,
                totalRulesModified: 0,
                averageConfidence: 0,
                successRate: 0
            }
        };

        this.saveSession(session);
        return sessionId;
    }

    static recordStep(
        sessionId: string,
        strategy: ResolutionStrategy,
        beforeState: ConditionalRule[],
        afterState: ConditionalRule[],
        resolvedConflicts: FixConflict[],
        remainingConflicts: FixConflict[],
        confidence: number
    ): ResolutionStep {
        const session = this.getSession(sessionId);
        if (!session) throw new Error('Session not found');

        const startTime = Date.now();
        const step: ResolutionStep = {
            id: `step-${startTime}`,
            timestamp: startTime,
            strategy,
            beforeState,
            afterState,
            resolvedConflicts,
            remainingConflicts,
            confidence,
            metadata: {
                rulesModified: this.countModifiedRules(beforeState, afterState),
                rulesAdded: this.countAddedRules(beforeState, afterState),
                rulesRemoved: this.countRemovedRules(beforeState, afterState),
                duration: Date.now() - startTime
            }
        };

        session.steps.push(step);
        session.finalState = afterState;
        this.updateSessionSummary(session);
        this.saveSession(session);

        return step;
    }

    static completeSession(sessionId: string): ResolutionSession {
        const session = this.getSession(sessionId);
        if (!session) throw new Error('Session not found');

        session.endTime = Date.now();
        this.updateSessionSummary(session);
        this.saveSession(session);

        return session;
    }

    static getSessionHistory(): ResolutionSession[] {
        try {
            const history = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading resolution history:', error);
            return [];
        }
    }

    static getSession(sessionId: string): ResolutionSession | null {
        const history = this.getSessionHistory();
        return history.find(session => session.id === sessionId) || null;
    }

    static getStepDetails(sessionId: string, stepId: string): ResolutionStep | null {
        const session = this.getSession(sessionId);
        if (!session) return null;
        return session.steps.find(step => step.id === stepId) || null;
    }

    static analyzeResolutionPatterns(): {
        mostSuccessfulStrategies: { strategyId: string; successRate: number }[];
        averageResolutionTime: number;
        commonConflictTypes: { type: string; count: number }[];
    } {
        const history = this.getSessionHistory();
        const strategyStats = new Map<string, { success: number; total: number }>();
        let totalTime = 0;
        const conflictTypes = new Map<string, number>();

        history.forEach(session => {
            totalTime += session.endTime - session.startTime;
            
            session.steps.forEach(step => {
                // Track strategy success
                const stats = strategyStats.get(step.strategy.id) || { success: 0, total: 0 };
                stats.total++;
                if (step.resolvedConflicts.length > 0) stats.success++;
                strategyStats.set(step.strategy.id, stats);

                // Track conflict types
                step.resolvedConflicts.forEach(conflict => {
                    conflictTypes.set(
                        conflict.type,
                        (conflictTypes.get(conflict.type) || 0) + 1
                    );
                });
            });
        });

        return {
            mostSuccessfulStrategies: Array.from(strategyStats.entries())
                .map(([id, stats]) => ({
                    strategyId: id,
                    successRate: stats.success / stats.total
                }))
                .sort((a, b) => b.successRate - a.successRate),
            averageResolutionTime: totalTime / history.length,
            commonConflictTypes: Array.from(conflictTypes.entries())
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count)
        };
    }

    static async exportHistory(format: 'json' | 'csv' | 'compressed' = 'json'): Promise<{ data: string; mimeType: string }> {
        const history = this.getSessionHistory();
        const exportData = {
            version: '1.0',
            timestamp: Date.now(),
            sessions: history,
            metadata: {
                totalSessions: history.length,
                successRate: this.calculateOverallSuccessRate(history),
                mostUsedStrategies: this.getMostUsedStrategies(history)
            }
        };

        switch (format) {
            case 'csv':
                return {
                    data: this.convertToCSV(exportData),
                    mimeType: 'text/csv'
                };
            
            case 'compressed':
                const compressed = await this.compressData(JSON.stringify(exportData));
                return {
                    data: compressed,
                    mimeType: 'application/x-compressed'
                };
            
            default:
                return {
                    data: JSON.stringify(exportData, null, 2),
                    mimeType: 'application/json'
                };
        }
    }

    private static convertToCSV(data: any): string {
        const sessions = data.sessions;
        const rows = [];

        // Header
        rows.push([
            'Session ID',
            'Start Time',
            'End Time',
            'Total Steps',
            'Conflicts Resolved',
            'Success Rate',
            'Applied Strategies',
            'Average Confidence'
        ].join(','));

        // Data rows
        sessions.forEach((session: ResolutionSession) => {
            const strategies = session.steps
                .map(step => step.strategy.id)
                .join(';');

            rows.push([
                session.id,
                new Date(session.startTime).toISOString(),
                new Date(session.endTime).toISOString(),
                session.steps.length,
                session.summary.totalConflictsResolved,
                session.summary.successRate.toFixed(2),
                `"${strategies}"`,
                session.summary.averageConfidence.toFixed(2)
            ].join(','));
        });

        return rows.join('\n');
    }

    private static async compressData(data: string): Promise<string> {
        // Use CompressionStream if available
        if (typeof CompressionStream !== 'undefined') {
            const blob = new Blob([data]);
            const compressedStream = blob.stream().pipeThrough(new CompressionStream('gzip'));
            const compressedBlob = await new Response(compressedStream).blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(compressedBlob);
            });
        }

        // Fallback to basic compression
        return this.basicCompress(data);
    }

    private static async decompressData(data: string): Promise<string> {
        // Use DecompressionStream if available
        if (typeof DecompressionStream !== 'undefined' && data.startsWith('data:')) {
            const blob = await fetch(data).then(r => r.blob());
            const decompressedStream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
            const decompressedBlob = await new Response(decompressedStream).blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsText(decompressedBlob);
            });
        }

        // Fallback to basic decompression
        return this.basicDecompress(data);
    }

    private static basicCompress(data: string): string {
        // Simple RLE compression
        let compressed = '';
        let count = 1;
        let current = data[0];

        for (let i = 1; i < data.length; i++) {
            if (data[i] === current && count < 255) {
                count++;
            } else {
                compressed += String.fromCharCode(count) + current;
                current = data[i];
                count = 1;
            }
        }
        compressed += String.fromCharCode(count) + current;

        return btoa(compressed);
    }

    private static basicDecompress(data: string): string {
        // Simple RLE decompression
        const compressed = atob(data);
        let decompressed = '';

        for (let i = 0; i < compressed.length; i += 2) {
            const count = compressed.charCodeAt(i);
            const char = compressed[i + 1];
            decompressed += char.repeat(count);
        }

        return decompressed;
    }

    static importHistory(data: string): boolean {
        try {
            const importData = JSON.parse(data);
            
            // Validate import data
            if (!this.validateImportData(importData)) {
                throw new Error('Invalid import data format');
            }

            // Merge with existing history
            const existingHistory = this.getSessionHistory();
            const mergedHistory = this.mergeHistories(existingHistory, importData.sessions);
            
            // Save merged history
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(mergedHistory));
            
            return true;
        } catch (error) {
            console.error('Error importing history:', error);
            return false;
        }
    }

    private static validateImportData(data: any): boolean {
        return (
            data.version &&
            data.timestamp &&
            Array.isArray(data.sessions) &&
            data.sessions.every((session: any) => (
                session.id &&
                session.startTime &&
                Array.isArray(session.steps) &&
                session.summary
            ))
        );
    }

    private static mergeHistories(
        existing: ResolutionSession[],
        imported: ResolutionSession[]
    ): ResolutionSession[] {
        const merged = new Map<string, ResolutionSession>();
        
        // Add existing sessions
        existing.forEach(session => merged.set(session.id, session));
        
        // Merge imported sessions
        imported.forEach(session => {
            if (!merged.has(session.id)) {
                merged.set(session.id, session);
            } else {
                // If session exists, keep the one with more steps
                const existingSession = merged.get(session.id)!;
                if (session.steps.length > existingSession.steps.length) {
                    merged.set(session.id, session);
                }
            }
        });
        
        // Convert back to array and sort by date
        return Array.from(merged.values())
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, this.MAX_SESSIONS);
    }

    private static saveSession(session: ResolutionSession) {
        const history = this.getSessionHistory()
            .filter(s => s.id !== session.id)
            .slice(-this.MAX_SESSIONS + 1);
        
        history.push(session);
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(history));
    }

    private static calculateOverallSuccessRate(sessions: ResolutionSession[]): number {
        if (sessions.length === 0) return 0;
        
        const totalSuccess = sessions.reduce(
            (sum, session) => sum + session.summary.successRate,
            0
        );
        return totalSuccess / sessions.length;
    }

    private static getMostUsedStrategies(sessions: ResolutionSession[]): Array<{
        strategyId: string;
        count: number;
        successRate: number;
    }> {
        const strategyStats = new Map<string, { count: number; successes: number }>();
        
        sessions.forEach(session => {
            session.steps.forEach(step => {
                const stats = strategyStats.get(step.strategy.id) || { count: 0, successes: 0 };
                stats.count++;
                if (step.resolvedConflicts.length > 0) {
                    stats.successes++;
                }
                strategyStats.set(step.strategy.id, stats);
            });
        });
        
        return Array.from(strategyStats.entries())
            .map(([strategyId, stats]) => ({
                strategyId,
                count: stats.count,
                successRate: stats.successes / stats.count
            }))
            .sort((a, b) => b.count - a.count);
    }

    private static updateSessionSummary(session: ResolutionSession) {
        const totalConflictsResolved = session.steps.reduce(
            (sum, step) => sum + step.resolvedConflicts.length,
            0
        );

        const totalRulesModified = session.steps.reduce(
            (sum, step) => sum + step.metadata.rulesModified,
            0
        );

        const averageConfidence = session.steps.reduce(
            (sum, step) => sum + step.confidence,
            0
        ) / session.steps.length;

        const successRate = totalConflictsResolved / 
            (totalConflictsResolved + session.steps[session.steps.length - 1]?.remainingConflicts.length || 1);

        session.summary = {
            totalConflictsResolved,
            totalRulesModified,
            averageConfidence,
            successRate
        };
    }

    private static countModifiedRules(before: ConditionalRule[], after: ConditionalRule[]): number {
        return after.filter(rule => 
            before.some(oldRule => 
                oldRule.id === rule.id && 
                JSON.stringify(oldRule) !== JSON.stringify(rule)
            )
        ).length;
    }

    private static countAddedRules(before: ConditionalRule[], after: ConditionalRule[]): number {
        const beforeIds = new Set(before.map(rule => rule.id));
        return after.filter(rule => !beforeIds.has(rule.id)).length;
    }

    private static countRemovedRules(before: ConditionalRule[], after: ConditionalRule[]): number {
        const afterIds = new Set(after.map(rule => rule.id));
        return before.filter(rule => !afterIds.has(rule.id)).length;
    }
}
