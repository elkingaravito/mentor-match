import { ConditionalRule } from '../components/analytics/ConditionalFormatting';
import { FixSuggestion } from './RuleAutoFixService';
import { ValidationWarning } from './RuleValidationService';

interface BatchFixResult {
    rules: ConditionalRule[];
    appliedFixes: FixSuggestion[];
    remainingWarnings: ValidationWarning[];
    summary: {
        rulesAdded: number;
        rulesRemoved: number;
        rulesModified: number;
        warningsResolved: number;
    };
}

export class BatchFixManager {
    static analyzeBatchFix(
        selectedFixes: FixSuggestion[],
        currentRules: ConditionalRule[],
        currentWarnings: ValidationWarning[]
    ): BatchFixResult {
        let rules = [...currentRules];
        const appliedFixes: FixSuggestion[] = [];
        const resolvedWarningIds = new Set<string>();

        // Apply fixes in sequence
        selectedFixes.forEach(fix => {
            const previousRules = [...rules];
            rules = fix.apply(rules);
            
            // Check if the fix made any changes
            if (JSON.stringify(rules) !== JSON.stringify(previousRules)) {
                appliedFixes.push(fix);
                
                // Mark warnings as resolved if they involve changed rules
                const changedRuleIds = this.findChangedRuleIds(previousRules, rules);
                currentWarnings.forEach(warning => {
                    if (warning.ruleIds.some(id => changedRuleIds.has(id))) {
                        resolvedWarningIds.add(warning.message);
                    }
                });
            }
        });

        // Calculate remaining warnings
        const remainingWarnings = currentWarnings.filter(
            warning => !resolvedWarningIds.has(warning.message)
        );

        // Calculate summary
        const summary = this.calculateChangeSummary(currentRules, rules);

        return {
            rules,
            appliedFixes,
            remainingWarnings,
            summary: {
                ...summary,
                warningsResolved: resolvedWarningIds.size
            }
        };
    }

    static findOptimalFixSequence(
        fixes: FixSuggestion[],
        currentRules: ConditionalRule[],
        currentWarnings: ValidationWarning[]
    ): FixSuggestion[] {
        // Sort fixes by impact (most impactful first)
        return fixes.sort((a, b) => {
            const aResult = this.analyzeBatchFix([a], currentRules, currentWarnings);
            const bResult = this.analyzeBatchFix([b], currentRules, currentWarnings);
            
            // Compare by warnings resolved
            if (aResult.summary.warningsResolved !== bResult.summary.warningsResolved) {
                return bResult.summary.warningsResolved - aResult.summary.warningsResolved;
            }
            
            // If same warnings resolved, prefer simpler changes
            const aComplexity = this.calculateChangeComplexity(aResult.summary);
            const bComplexity = this.calculateChangeComplexity(bResult.summary);
            return aComplexity - bComplexity;
        });
    }

    private static findChangedRuleIds(
        oldRules: ConditionalRule[],
        newRules: ConditionalRule[]
    ): Set<string> {
        const changedIds = new Set<string>();
        
        // Find removed rules
        oldRules.forEach(oldRule => {
            if (!newRules.find(newRule => newRule.id === oldRule.id)) {
                changedIds.add(oldRule.id);
            }
        });

        // Find added or modified rules
        newRules.forEach(newRule => {
            const oldRule = oldRules.find(old => old.id === newRule.id);
            if (!oldRule || JSON.stringify(oldRule) !== JSON.stringify(newRule)) {
                changedIds.add(newRule.id);
            }
        });

        return changedIds;
    }

    private static calculateChangeSummary(
        oldRules: ConditionalRule[],
        newRules: ConditionalRule[]
    ) {
        const added = newRules.filter(
            newRule => !oldRules.find(old => old.id === newRule.id)
        ).length;

        const removed = oldRules.filter(
            oldRule => !newRules.find(newRule => newRule.id === oldRule.id)
        ).length;

        const modified = newRules.filter(newRule => {
            const oldRule = oldRules.find(old => old.id === newRule.id);
            return oldRule && JSON.stringify(oldRule) !== JSON.stringify(newRule);
        }).length;

        return {
            rulesAdded: added,
            rulesRemoved: removed,
            rulesModified: modified
        };
    }

    private static calculateChangeComplexity(summary: {
        rulesAdded: number;
        rulesRemoved: number;
        rulesModified: number;
    }): number {
        // Weight different types of changes
        return (
            summary.rulesAdded * 2 +    // Adding rules is more complex
            summary.rulesRemoved * 1 +   // Removing rules is simpler
            summary.rulesModified * 1.5  // Modifying rules is moderately complex
        );
    }
}