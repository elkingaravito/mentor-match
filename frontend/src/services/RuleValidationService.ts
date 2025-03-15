import { ConditionalRule } from '../components/analytics/ConditionalFormatting';

export interface ValidationWarning {
    type: 'error' | 'warning';
    message: string;
    ruleIds: string[];
    description: string;
    suggestion?: string;
}

export class RuleValidationService {
    static validateRules(rules: ConditionalRule[], columnType: string): ValidationWarning[] {
        const warnings: ValidationWarning[] = [];

        // Check for empty rules
        rules.forEach(rule => {
            if (!rule.value1 && rule.operator !== 'notContains') {
                warnings.push({
                    type: 'error',
                    message: 'Empty value',
                    ruleIds: [rule.id],
                    description: 'Rule has no value specified',
                    suggestion: 'Add a value to make the rule functional'
                });
            }
        });

        // Check for overlapping numeric ranges
        if (columnType === 'number') {
            for (let i = 0; i < rules.length; i++) {
                for (let j = i + 1; j < rules.length; j++) {
                    const overlap = this.checkNumericOverlap(rules[i], rules[j]);
                    if (overlap) {
                        warnings.push({
                            type: 'warning',
                            message: 'Overlapping ranges',
                            ruleIds: [rules[i].id, rules[j].id],
                            description: `Rules ${i + 1} and ${j + 1} have overlapping ranges`,
                            suggestion: 'Consider adjusting ranges to avoid conflicts'
                        });
                    }
                }
            }
        }

        // Check for conflicting conditions
        for (let i = 0; i < rules.length; i++) {
            for (let j = i + 1; j < rules.length; j++) {
                const conflict = this.checkConflictingConditions(rules[i], rules[j]);
                if (conflict) {
                    warnings.push({
                        type: 'warning',
                        message: 'Conflicting conditions',
                        ruleIds: [rules[i].id, rules[j].id],
                        description: conflict,
                        suggestion: 'Review rule order or combine rules'
                    });
                }
            }
        }

        // Check for unreachable rules
        for (let i = 0; i < rules.length - 1; i++) {
            const unreachable = this.checkUnreachableRule(rules[i], rules[i + 1]);
            if (unreachable) {
                warnings.push({
                    type: 'error',
                    message: 'Unreachable rule',
                    ruleIds: [rules[i + 1].id],
                    description: `Rule ${i + 2} will never be reached due to Rule ${i + 1}`,
                    suggestion: 'Consider removing or reordering the rule'
                });
            }
        }

        // Validate type-specific rules
        rules.forEach(rule => {
            const typeWarning = this.validateTypeSpecificRule(rule, columnType);
            if (typeWarning) {
                warnings.push(typeWarning);
            }
        });

        return warnings;
    }

    private static checkNumericOverlap(rule1: ConditionalRule, rule2: ConditionalRule): boolean {
        if (rule1.operator === 'between' && rule2.operator === 'between') {
            const min1 = Math.min(Number(rule1.value1), Number(rule1.value2 || rule1.value1));
            const max1 = Math.max(Number(rule1.value1), Number(rule1.value2 || rule1.value1));
            const min2 = Math.min(Number(rule2.value1), Number(rule2.value2 || rule2.value1));
            const max2 = Math.max(Number(rule2.value1), Number(rule2.value2 || rule2.value1));

            return !(max1 < min2 || min1 > max2);
        }

        return false;
    }

    private static checkConflictingConditions(rule1: ConditionalRule, rule2: ConditionalRule): string | null {
        if (rule1.operator === 'equals' && rule2.operator === 'equals' && rule1.value1 === rule2.value1) {
            return 'Multiple rules match the same exact value';
        }

        if (rule1.operator === 'contains' && rule2.operator === 'contains') {
            const str1 = String(rule1.value1).toLowerCase();
            const str2 = String(rule2.value1).toLowerCase();
            if (str1.includes(str2) || str2.includes(str1)) {
                return 'Overlapping text patterns';
            }
        }

        return null;
    }

    private static checkUnreachableRule(rule1: ConditionalRule, rule2: ConditionalRule): boolean {
        if (rule1.operator === 'equals' && rule2.operator === 'equals' && rule1.value1 === rule2.value1) {
            return true;
        }

        if (rule1.operator === 'contains' && rule2.operator === 'contains') {
            return String(rule1.value1).includes(String(rule2.value1));
        }

        return false;
    }

    private static validateTypeSpecificRule(rule: ConditionalRule, columnType: string): ValidationWarning | null {
        switch (columnType) {
            case 'number':
                if (isNaN(Number(rule.value1)) || (rule.value2 && isNaN(Number(rule.value2)))) {
                    return {
                        type: 'error',
                        message: 'Invalid number',
                        ruleIds: [rule.id],
                        description: 'Non-numeric value used in numeric comparison',
                        suggestion: 'Use only numeric values for this column type'
                    };
                }
                break;

            case 'date':
                if (!this.isValidDate(rule.value1) || (rule.value2 && !this.isValidDate(rule.value2))) {
                    return {
                        type: 'error',
                        message: 'Invalid date',
                        ruleIds: [rule.id],
                        description: 'Invalid date format used',
                        suggestion: 'Use valid date format (YYYY-MM-DD)'
                    };
                }
                break;
        }

        return null;
    }

    private static isValidDate(dateStr: string): boolean {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date.getTime());
    }
}