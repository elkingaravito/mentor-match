import { ConditionalRule } from '../components/analytics/ConditionalFormatting';
import { FixSuggestion } from './RuleAutoFixService';

export interface FixConflict {
    type: 'direct' | 'indirect' | 'override';
    severity: 'high' | 'medium' | 'low';
    description: string;
    fixes: string[];  // IDs of conflicting fixes
    impact: string;
    resolution?: {
        description: string;
        apply: (rules: ConditionalRule[]) => ConditionalRule[];
    };
}

export class FixConflictService {
    static detectConflicts(
        fixes: FixSuggestion[],
        currentRules: ConditionalRule[]
    ): FixConflict[] {
        const conflicts: FixConflict[] = [];

        // Check for direct rule conflicts
        conflicts.push(...this.detectDirectConflicts(fixes));

        // Check for rule override conflicts
        conflicts.push(...this.detectOverrideConflicts(fixes, currentRules));

        // Check for indirect effects
        conflicts.push(...this.detectIndirectConflicts(fixes, currentRules));

        return conflicts;
    }

    private static detectDirectConflicts(fixes: FixSuggestion[]): FixConflict[] {
        const conflicts: FixConflict[] = [];

        for (let i = 0; i < fixes.length; i++) {
            for (let j = i + 1; j < fixes.length; j++) {
                const fix1 = fixes[i];
                const fix2 = fixes[j];

                // Check for same rule modifications
                if (this.modifySameRules(fix1, fix2)) {
                    conflicts.push({
                        type: 'direct',
                        severity: 'high',
                        description: 'Multiple fixes modify the same rules',
                        fixes: [fix1.id, fix2.id],
                        impact: 'Changes may override each other',
                        resolution: {
                            description: 'Apply fixes sequentially',
                            apply: (rules) => fix2.apply(fix1.apply(rules))
                        }
                    });
                }

                // Check for contradictory changes
                if (this.haveContradictoryEffects(fix1, fix2)) {
                    conflicts.push({
                        type: 'direct',
                        severity: 'high',
                        description: 'Fixes have contradictory effects',
                        fixes: [fix1.id, fix2.id],
                        impact: 'Changes may nullify each other'
                    });
                }
            }
        }

        return conflicts;
    }

    private static detectOverrideConflicts(
        fixes: FixSuggestion[],
        currentRules: ConditionalRule[]
    ): FixConflict[] {
        const conflicts: FixConflict[] = [];

        fixes.forEach(fix => {
            const affectedRules = this.getAffectedRules(fix, currentRules);
            const overriddenRules = this.findOverriddenRules(affectedRules, currentRules);

            if (overriddenRules.length > 0) {
                conflicts.push({
                    type: 'override',
                    severity: 'medium',
                    description: 'Fix overrides existing rules',
                    fixes: [fix.id],
                    impact: `Will override ${overriddenRules.length} existing rules`,
                    resolution: {
                        description: 'Merge with existing rules',
                        apply: (rules) => this.mergeRules(rules, overriddenRules)
                    }
                });
            }
        });

        return conflicts;
    }

    private static detectIndirectConflicts(
        fixes: FixSuggestion[],
        currentRules: ConditionalRule[]
    ): FixConflict[] {
        const conflicts: FixConflict[] = [];

        fixes.forEach(fix => {
            const indirectEffects = this.analyzeIndirectEffects(fix, currentRules);
            
            if (indirectEffects.hasUnintendedEffects) {
                conflicts.push({
                    type: 'indirect',
                    severity: 'low',
                    description: 'Fix may have unintended side effects',
                    fixes: [fix.id],
                    impact: indirectEffects.description
                });
            }
        });

        return conflicts;
    }

    private static modifySameRules(fix1: FixSuggestion, fix2: FixSuggestion): boolean {
        const rules1 = this.getTargetRuleIds(fix1);
        const rules2 = this.getTargetRuleIds(fix2);
        return rules1.some(id => rules2.includes(id));
    }

    private static haveContradictoryEffects(
        fix1: FixSuggestion,
        fix2: FixSuggestion
    ): boolean {
        // Compare fix effects to detect contradictions
        const effect1 = this.analyzeFixEffect(fix1);
        const effect2 = this.analyzeFixEffect(fix2);
        return this.areEffectsContradictory(effect1, effect2);
    }

    private static getTargetRuleIds(fix: FixSuggestion): string[] {
        // Extract rule IDs that the fix will modify
        return fix.description.match(/rule-\d+/g) || [];
    }

    private static analyzeFixEffect(fix: FixSuggestion): any {
        // Analyze what the fix does (e.g., changes to values, conditions)
        return {
            type: fix.description.includes('merge') ? 'merge' :
                  fix.description.includes('split') ? 'split' :
                  'modify',
            // Add more effect analysis as needed
        };
    }

    private static areEffectsContradictory(effect1: any, effect2: any): boolean {
        // Compare effects to determine if they contradict each other
        return (effect1.type === 'merge' && effect2.type === 'split') ||
               (effect1.type === 'split' && effect2.type === 'merge');
    }

    private static getAffectedRules(
        fix: FixSuggestion,
        currentRules: ConditionalRule[]
    ): ConditionalRule[] {
        // Determine which rules will be affected by the fix
        const targetIds = this.getTargetRuleIds(fix);
        return currentRules.filter(rule => targetIds.includes(rule.id));
    }

    private static findOverriddenRules(
        affectedRules: ConditionalRule[],
        currentRules: ConditionalRule[]
    ): ConditionalRule[] {
        // Find rules that will be overridden by the changes
        return currentRules.filter(rule =>
            affectedRules.some(affected =>
                this.rulesOverlap(affected, rule) && !affectedRules.includes(rule)
            )
        );
    }

    private static rulesOverlap(rule1: ConditionalRule, rule2: ConditionalRule): boolean {
        // Check if rules have overlapping conditions
        if (rule1.operator === rule2.operator) {
            switch (rule1.operator) {
                case 'between':
                    return this.rangesOverlap(
                        Number(rule1.value1),
                        Number(rule1.value2),
                        Number(rule2.value1),
                        Number(rule2.value2)
                    );
                case 'equals':
                    return rule1.value1 === rule2.value1;
                // Add more operator comparisons as needed
            }
        }
        return false;
    }

    private static rangesOverlap(
        min1: number,
        max1: number,
        min2: number,
        max2: number
    ): boolean {
        return Math.max(min1, min2) <= Math.min(max1, max2);
    }

    private static mergeRules(
        rules: ConditionalRule[],
        overriddenRules: ConditionalRule[]
    ): ConditionalRule[] {
        // Implement rule merging logic
        return rules.map(rule => {
            const overridden = overriddenRules.find(o => this.rulesOverlap(rule, o));
            if (overridden) {
                return {
                    ...rule,
                    style: {
                        ...rule.style,
                        ...overridden.style
                    }
                };
            }
            return rule;
        });
    }

    private static analyzeIndirectEffects(
        fix: FixSuggestion,
        currentRules: ConditionalRule[]
    ): { hasUnintendedEffects: boolean; description: string } {
        // Analyze potential indirect effects of the fix
        const affectedRules = this.getAffectedRules(fix, currentRules);
        const dependencies = this.findRuleDependencies(affectedRules, currentRules);

        if (dependencies.length > 0) {
            return {
                hasUnintendedEffects: true,
                description: `May affect ${dependencies.length} dependent rules`
            };
        }

        return {
            hasUnintendedEffects: false,
            description: ''
        };
    }

    private static findRuleDependencies(
        rules: ConditionalRule[],
        allRules: ConditionalRule[]
    ): ConditionalRule[] {
        // Find rules that depend on the affected rules
        return allRules.filter(rule =>
            rules.some(affected =>
                this.rulesDependOn(rule, affected)
            )
        );
    }

    private static rulesDependOn(rule1: ConditionalRule, rule2: ConditionalRule): boolean {
        // Check if rule1 depends on rule2
        // This could be through shared conditions, values, or other relationships
        return false; // Implement actual dependency detection logic
    }
}