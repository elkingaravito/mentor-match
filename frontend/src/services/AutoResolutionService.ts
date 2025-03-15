import { ConditionalRule } from '../components/analytics/ConditionalFormatting';
import { FixSuggestion } from './RuleAutoFixService';
import { FixConflict } from './FixConflictService';

export interface ResolutionStrategy {
    id: string;
    name: string;
    description: string;
    confidence: number;
    apply: (rules: ConditionalRule[], fixes: FixSuggestion[]) => ConditionalRule[];
}

export interface ResolutionResult {
    resolvedRules: ConditionalRule[];
    appliedStrategies: string[];
    remainingConflicts: FixConflict[];
    summary: {
        rulesModified: number;
        conflictsResolved: number;
        confidence: number;
    };
}

export class AutoResolutionService {
    private static readonly strategies: ResolutionStrategy[] = [
        {
            id: 'merge-overlapping',
            name: 'Merge Overlapping Rules',
            description: 'Combines rules with overlapping conditions',
            confidence: 0.9,
            apply: (rules, fixes) => {
                return this.mergeOverlappingRules(rules);
            }
        },
        {
            id: 'optimize-ranges',
            name: 'Optimize Value Ranges',
            description: 'Adjusts numeric ranges to eliminate overlaps',
            confidence: 0.8,
            apply: (rules, fixes) => {
                return this.optimizeValueRanges(rules);
            }
        },
        {
            id: 'reorder-rules',
            name: 'Reorder Rules',
            description: 'Reorders rules to resolve precedence conflicts',
            confidence: 0.7,
            apply: (rules, fixes) => {
                return this.reorderRules(rules);
            }
        },
        {
            id: 'combine-styles',
            name: 'Combine Styles',
            description: 'Merges compatible style properties',
            confidence: 0.85,
            apply: (rules, fixes) => {
                return this.combineStyles(rules);
            }
        }
    ];

    static autoResolveConflicts(
        rules: ConditionalRule[],
        fixes: FixSuggestion[],
        conflicts: FixConflict[]
    ): ResolutionResult {
        let currentRules = [...rules];
        const appliedStrategies: string[] = [];
        let resolvedConflictCount = 0;

        // Sort strategies by confidence
        const sortedStrategies = [...this.strategies]
            .sort((a, b) => b.confidence - a.confidence);

        // Apply strategies until no more conflicts are resolved
        let previousConflictCount = conflicts.length;
        let iterations = 0;
        const maxIterations = 5;

        while (iterations < maxIterations) {
            for (const strategy of sortedStrategies) {
                const previousRules = [...currentRules];
                currentRules = strategy.apply(currentRules, fixes);

                // Check if strategy made any changes
                if (JSON.stringify(previousRules) !== JSON.stringify(currentRules)) {
                    appliedStrategies.push(strategy.id);
                }
            }

            // Check remaining conflicts
            const remainingConflicts = this.detectRemainingConflicts(currentRules, fixes);
            
            if (remainingConflicts.length >= previousConflictCount) {
                break; // No improvement, stop iterations
            }

            resolvedConflictCount += (previousConflictCount - remainingConflicts.length);
            previousConflictCount = remainingConflicts.length;
            iterations++;
        }

        return {
            resolvedRules: currentRules,
            appliedStrategies,
            remainingConflicts: this.detectRemainingConflicts(currentRules, fixes),
            summary: {
                rulesModified: this.countModifiedRules(rules, currentRules),
                conflictsResolved: resolvedConflictCount,
                confidence: this.calculateConfidence(appliedStrategies)
            }
        };
    }

    private static mergeOverlappingRules(rules: ConditionalRule[]): ConditionalRule[] {
        const mergedRules: ConditionalRule[] = [];
        const processedIds = new Set<string>();

        for (let i = 0; i < rules.length; i++) {
            if (processedIds.has(rules[i].id)) continue;

            let currentRule = { ...rules[i] };
            processedIds.add(currentRule.id);

            for (let j = i + 1; j < rules.length; j++) {
                if (processedIds.has(rules[j].id)) continue;

                if (this.canMergeRules(currentRule, rules[j])) {
                    currentRule = this.mergeRules(currentRule, rules[j]);
                    processedIds.add(rules[j].id);
                }
            }

            mergedRules.push(currentRule);
        }

        return mergedRules;
    }

    private static optimizeValueRanges(rules: ConditionalRule[]): ConditionalRule[] {
        return rules.map(rule => {
            if (rule.operator === 'between' && rule.value1 && rule.value2) {
                const [min, max] = this.findOptimalRange(
                    Number(rule.value1),
                    Number(rule.value2),
                    rules.filter(r => r.id !== rule.id)
                );
                return { ...rule, value1: min, value2: max };
            }
            return rule;
        });
    }

    private static reorderRules(rules: ConditionalRule[]): ConditionalRule[] {
        return [...rules].sort((a, b) => {
            // Sort by specificity and priority
            const specificityA = this.calculateRuleSpecificity(a);
            const specificityB = this.calculateRuleSpecificity(b);
            return specificityB - specificityA;
        });
    }

    private static combineStyles(rules: ConditionalRule[]): ConditionalRule[] {
        return rules.map(rule => {
            const relatedRules = rules.filter(r => 
                r.id !== rule.id && this.hasStyleOverlap(rule, r)
            );

            if (relatedRules.length > 0) {
                return {
                    ...rule,
                    style: this.mergeStyles([rule, ...relatedRules])
                };
            }

            return rule;
        });
    }

    private static canMergeRules(rule1: ConditionalRule, rule2: ConditionalRule): boolean {
        return rule1.operator === rule2.operator &&
               this.hasStyleCompatibility(rule1, rule2);
    }

    private static mergeRules(rule1: ConditionalRule, rule2: ConditionalRule): ConditionalRule {
        return {
            ...rule1,
            id: `merged-${rule1.id}-${rule2.id}`,
            value1: this.mergeValues(rule1.value1, rule2.value1),
            value2: this.mergeValues(rule1.value2, rule2.value2),
            style: this.mergeStyles([rule1, rule2])
        };
    }

    private static mergeValues(value1: any, value2: any): any {
        if (typeof value1 === 'number' && typeof value2 === 'number') {
            return Math.min(value1, value2);
        }
        return value1;
    }

    private static mergeStyles(rules: ConditionalRule[]): any {
        const baseStyle = { ...rules[0].style };
        
        for (let i = 1; i < rules.length; i++) {
            Object.entries(rules[i].style).forEach(([key, value]) => {
                if (!baseStyle[key]) {
                    baseStyle[key] = value;
                }
            });
        }

        return baseStyle;
    }

    private static hasStyleCompatibility(rule1: ConditionalRule, rule2: ConditionalRule): boolean {
        const style1 = rule1.style || {};
        const style2 = rule2.style || {};
        
        // Check for conflicting style properties
        return !Object.keys(style1).some(key => 
            style2[key] && style1[key] !== style2[key]
        );
    }

    private static hasStyleOverlap(rule1: ConditionalRule, rule2: ConditionalRule): boolean {
        const style1 = rule1.style || {};
        const style2 = rule2.style || {};
        
        return Object.keys(style1).some(key => style2[key] !== undefined);
    }

    private static calculateRuleSpecificity(rule: ConditionalRule): number {
        // Higher number means more specific
        switch (rule.operator) {
            case 'equals':
                return 100;
            case 'between':
                return 80;
            case 'contains':
                return 60;
            default:
                return 40;
        }
    }

    private static findOptimalRange(
        min: number,
        max: number,
        otherRules: ConditionalRule[]
    ): [number, number] {
        // Find gaps in other rules' ranges
        const ranges = otherRules
            .filter(r => r.operator === 'between')
            .map(r => [Number(r.value1), Number(r.value2)])
            .sort(([a], [b]) => a - b);

        // Find the best gap that includes or is closest to the original range
        let bestRange: [number, number] = [min, max];
        let minOverlap = Infinity;

        for (let i = 0; i < ranges.length - 1; i++) {
            const gapStart = ranges[i][1];
            const gapEnd = ranges[i + 1][0];
            
            if (gapEnd - gapStart >= max - min) {
                const overlap = Math.abs(gapStart - min) + Math.abs(gapEnd - max);
                if (overlap < minOverlap) {
                    minOverlap = overlap;
                    bestRange = [gapStart, gapEnd];
                }
            }
        }

        return bestRange;
    }

    private static detectRemainingConflicts(
        rules: ConditionalRule[],
        fixes: FixSuggestion[]
    ): FixConflict[] {
        // Implement conflict detection logic
        return [];
    }

    private static countModifiedRules(
        originalRules: ConditionalRule[],
        newRules: ConditionalRule[]
    ): number {
        const originalIds = new Set(originalRules.map(r => r.id));
        const newIds = new Set(newRules.map(r => r.id));
        
        return originalRules.length - 
               [...originalIds].filter(id => newIds.has(id)).length +
               [...newIds].filter(id => !originalIds.has(id)).length;
    }

    private static calculateConfidence(appliedStrategyIds: string[]): number {
        if (appliedStrategyIds.length === 0) return 1;

        const totalConfidence = appliedStrategyIds
            .map(id => this.strategies.find(s => s.id === id)?.confidence || 0)
            .reduce((sum, conf) => sum + conf, 0);

        return totalConfidence / appliedStrategyIds.length;
    }
}