import { ConditionalRule } from '../components/analytics/ConditionalFormatting';
import { ValidationWarning } from './RuleValidationService';

export interface FixSuggestion {
    id: string;
    description: string;
    impact: string;
    apply: (rules: ConditionalRule[]) => ConditionalRule[];
}

export class RuleAutoFixService {
    static generateFixes(warning: ValidationWarning, rules: ConditionalRule[]): FixSuggestion[] {
        switch (warning.message) {
            case 'Overlapping ranges':
                return this.generateOverlapFixes(warning, rules);
            case 'Conflicting conditions':
                return this.generateConflictFixes(warning, rules);
            case 'Unreachable rule':
                return this.generateUnreachableFixes(warning, rules);
            case 'Empty value':
                return this.generateEmptyValueFixes(warning, rules);
            default:
                return [];
        }
    }

    private static generateOverlapFixes(warning: ValidationWarning, rules: ConditionalRule[]): FixSuggestion[] {
        const [rule1, rule2] = warning.ruleIds.map(id => rules.find(r => r.id === id)!);
        
        return [
            {
                id: 'merge-ranges',
                description: 'Merge overlapping ranges into a single rule',
                impact: 'Combines both rules into one with the most inclusive range',
                apply: (rules) => {
                    const newRules = rules.filter(r => !warning.ruleIds.includes(r.id));
                    const min = Math.min(
                        Number(rule1.value1),
                        Number(rule1.value2 || rule1.value1),
                        Number(rule2.value1),
                        Number(rule2.value2 || rule2.value1)
                    );
                    const max = Math.max(
                        Number(rule1.value1),
                        Number(rule1.value2 || rule1.value1),
                        Number(rule2.value1),
                        Number(rule2.value2 || rule2.value1)
                    );
                    
                    return [
                        ...newRules,
                        {
                            ...rule1,
                            id: `merged-${rule1.id}-${rule2.id}`,
                            operator: 'between',
                            value1: min,
                            value2: max
                        }
                    ];
                }
            },
            {
                id: 'split-range',
                description: 'Split into non-overlapping ranges',
                impact: 'Creates multiple rules with distinct ranges',
                apply: (rules) => {
                    const newRules = rules.filter(r => !warning.ruleIds.includes(r.id));
                    const values = [
                        Number(rule1.value1),
                        Number(rule1.value2 || rule1.value1),
                        Number(rule2.value1),
                        Number(rule2.value2 || rule2.value1)
                    ].sort((a, b) => a - b);
                    
                    return [
                        ...newRules,
                        ...this.createSplitRangeRules(values, rule1)
                    ];
                }
            }
        ];
    }

    private static generateConflictFixes(warning: ValidationWarning, rules: ConditionalRule[]): FixSuggestion[] {
        const [rule1, rule2] = warning.ruleIds.map(id => rules.find(r => r.id === id)!);
        
        return [
            {
                id: 'combine-rules',
                description: 'Combine conflicting rules',
                impact: 'Merges rules with the same conditions',
                apply: (rules) => {
                    const newRules = rules.filter(r => !warning.ruleIds.includes(r.id));
                    return [
                        ...newRules,
                        {
                            ...rule1,
                            id: `combined-${rule1.id}-${rule2.id}`,
                            style: {
                                ...rule1.style,
                                backgroundColor: rule1.style.backgroundColor || rule2.style.backgroundColor
                            }
                        }
                    ];
                }
            },
            {
                id: 'prioritize-rule',
                description: 'Keep only the first rule',
                impact: 'Removes the redundant rule',
                apply: (rules) => rules.filter(r => r.id !== rule2.id)
            }
        ];
    }

    private static generateUnreachableFixes(warning: ValidationWarning, rules: ConditionalRule[]): FixSuggestion[] {
        return [
            {
                id: 'remove-unreachable',
                description: 'Remove unreachable rule',
                impact: 'Removes rule that will never be applied',
                apply: (rules) => rules.filter(r => !warning.ruleIds.includes(r.id))
            },
            {
                id: 'reorder-rules',
                description: 'Reorder rules',
                impact: 'Changes rule order to make all rules reachable',
                apply: (rules) => {
                    const unreachableRule = rules.find(r => warning.ruleIds.includes(r.id))!;
                    const otherRules = rules.filter(r => !warning.ruleIds.includes(r.id));
                    return [unreachableRule, ...otherRules];
                }
            }
        ];
    }

    private static generateEmptyValueFixes(warning: ValidationWarning, rules: ConditionalRule[]): FixSuggestion[] {
        const emptyRule = rules.find(r => warning.ruleIds.includes(r.id))!;
        
        return [
            {
                id: 'remove-empty',
                description: 'Remove empty rule',
                impact: 'Removes rule with no value',
                apply: (rules) => rules.filter(r => !warning.ruleIds.includes(r.id))
            },
            {
                id: 'default-value',
                description: 'Add default value',
                impact: 'Adds a default value based on the operator',
                apply: (rules) => rules.map(rule => 
                    rule.id === emptyRule.id
                        ? {
                            ...rule,
                            value1: this.getDefaultValue(rule.operator)
                        }
                        : rule
                )
            }
        ];
    }

    private static createSplitRangeRules(values: number[], templateRule: ConditionalRule): ConditionalRule[] {
        const uniqueValues = Array.from(new Set(values));
        return uniqueValues.slice(0, -1).map((value, index) => ({
            ...templateRule,
            id: `split-${templateRule.id}-${index}`,
            operator: 'between',
            value1: value,
            value2: uniqueValues[index + 1]
        }));
    }

    private static getDefaultValue(operator: string): any {
        switch (operator) {
            case 'equals':
            case 'notEquals':
                return '';
            case 'greaterThan':
            case 'lessThan':
                return 0;
            case 'between':
                return [0, 100];
            case 'contains':
            case 'notContains':
                return '';
            default:
                return '';
        }
    }
}