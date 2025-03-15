import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondary,
    Checkbox,
    Typography,
    Box,
    Divider,
    Paper,
    Chip,
    Grid,
    Alert
} from '@mui/material';
import { FixSuggestion } from '../../services/RuleAutoFixService';
import { ValidationWarning } from '../../services/RuleValidationService';
import { BatchFixManager } from '../../services/BatchFixManager';
import { ConditionalRule } from './ConditionalFormatting';

interface BatchFixDialogProps {
    open: boolean;
    onClose: () => void;
    onApply: (rules: ConditionalRule[]) => void;
    currentRules: ConditionalRule[];
    availableFixes: FixSuggestion[];
    currentWarnings: ValidationWarning[];
}

export const BatchFixDialog: React.FC<BatchFixDialogProps> = ({
    open,
    onClose,
    onApply,
    currentRules,
    availableFixes,
    currentWarnings
}) => {
    const [selectedFixes, setSelectedFixes] = useState<Set<string>>(new Set());
    const [previewResult, setPreviewResult] = useState<any>(null);
    const [conflicts, setConflicts] = useState<FixConflict[]>([]);
    const [resolutionResult, setResolutionResult] = useState<ResolutionResult | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            const newSessionId = ResolutionHistoryService.startNewSession();
            setSessionId(newSessionId);
        }
    }, [open]);

    const handleAutoResolve = () => {
        if (resolutionResult && sessionId) {
            resolutionResult.appliedStrategies.forEach((strategyId, index) => {
                const strategy = AutoResolutionService.strategies.find(s => s.id === strategyId);
                if (strategy) {
                    ResolutionHistoryService.recordStep(
                        sessionId,
                        strategy,
                        index === 0 ? currentRules : resolutionResult.resolvedRules,
                        resolutionResult.resolvedRules,
                        resolutionResult.resolvedConflicts,
                        resolutionResult.remainingConflicts,
                        resolutionResult.summary.confidence
                    );
                }
            });
            
            ResolutionHistoryService.completeSession(sessionId);
            onApply(resolutionResult.resolvedRules);
        }
    };
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            const newSessionId = ResolutionHistoryService.startNewSession();
            setSessionId(newSessionId);
        }
    }, [open]);

    useEffect(() => {
        if (selectedFixes.size > 1) {
            const selectedFixObjects = availableFixes.filter(fix => 
                selectedFixes.has(fix.id)
            );
            const detectedConflicts = FixConflictService.detectConflicts(
                selectedFixObjects,
                currentRules
            );
            setConflicts(detectedConflicts);

            if (detectedConflicts.length > 0) {
                const result = AutoResolutionService.autoResolveConflicts(
                    currentRules,
                    selectedFixObjects,
                    detectedConflicts
                );
                setResolutionResult(result);
            } else {
                setResolutionResult(null);
            }
        } else {
            setConflicts([]);
            setResolutionResult(null);
        }
    }, [selectedFixes]);

    const handleAutoResolve = () => {
        if (resolutionResult && sessionId) {
            resolutionResult.appliedStrategies.forEach((strategyId, index) => {
                const strategy = AutoResolutionService.strategies.find(s => s.id === strategyId);
                if (strategy) {
                    ResolutionHistoryService.recordStep(
                        sessionId,
                        strategy,
                        index === 0 ? currentRules : resolutionResult.resolvedRules,
                        resolutionResult.resolvedRules,
                        resolutionResult.resolvedConflicts,
                        resolutionResult.remainingConflicts,
                        resolutionResult.summary.confidence
                    );
                }
            });
            
            ResolutionHistoryService.completeSession(sessionId);
            onApply(resolutionResult.resolvedRules);
        }
    };

    const orderedFixes = BatchFixManager.findOptimalFixSequence(
        availableFixes,
        currentRules,
        currentWarnings
    );

    useEffect(() => {
        if (selectedFixes.size > 0) {
            const selectedFixObjects = orderedFixes.filter(fix => 
                selectedFixes.has(fix.id)
            );
            const result = BatchFixManager.analyzeBatchFix(
                selectedFixObjects,
                currentRules,
                currentWarnings
            );
            setPreviewResult(result);
        } else {
            setPreviewResult(null);
        }
    }, [selectedFixes]);

    const handleToggleFix = (fixId: string) => {
        const newSelected = new Set(selectedFixes);
        if (newSelected.has(fixId)) {
            newSelected.delete(fixId);
        } else {
            newSelected.add(fixId);
        }
        setSelectedFixes(newSelected);
    };

    const handleApplyBatch = () => {
        if (previewResult) {
            onApply(previewResult.rules);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle>Apply Multiple Fixes</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={8}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Available Fixes
                        </Typography>
                        <List>
                            {orderedFixes.map((fix) => (
                                <ListItem
                                    key={fix.id}
                                    dense
                                    button
                                    onClick={() => handleToggleFix(fix.id)}
                                >
                                    <Checkbox
                                        edge="start"
                                        checked={selectedFixes.has(fix.id)}
                                        tabIndex={-1}
                                    />
                                    <ListItemText
                                        primary={fix.description}
                                        secondary={fix.impact}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    <Grid item xs={8}>
                        {conflicts.length > 0 && (
                            <Box mb={2}>
                                <FixConflictWarning
                                    conflicts={conflicts}
                                    onResolve={(resolution) => {
                                        const newRules = resolution(currentRules);
                                        setPreviewResult({
                                            ...previewResult,
                                            rules: newRules
                                        });
                                    }}
                                />
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={4}>
                        <ResolutionHistory currentSessionId={sessionId} />
                    </Grid>

                    <Grid item xs={12}>
                                {resolutionResult && (
                                    <Box mt={2}>
                                        <Alert
                                            severity="info"
                                            action={
                                                <Button
                                                    color="inherit"
                                                    size="small"
                                                    onClick={handleAutoResolve}
                                                >
                                                    Apply Auto-Resolution
                                                </Button>
                                            }
                                        >
                                            <AlertTitle>
                                                Automatic Resolution Available
                                            </AlertTitle>
                                            <Typography variant="body2" gutterBottom>
                                                {resolutionResult.summary.conflictsResolved} conflicts can be automatically resolved
                                                (Confidence: {Math.round(resolutionResult.summary.confidence * 100)}%)
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Using strategies: {resolutionResult.appliedStrategies.join(', ')}
                                            </Typography>
                                        </Alert>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Preview Impact
                        </Typography>
                        {previewResult ? (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    <Box>
                                        <Typography variant="subtitle2">
                                            Changes Summary
                                        </Typography>
                                        <Box display="flex" gap={1} mt={1}>
                                            <Chip
                                                label={`${previewResult.summary.rulesAdded} Added`}
                                                color="success"
                                                size="small"
                                            />
                                            <Chip
                                                label={`${previewResult.summary.rulesRemoved} Removed`}
                                                color="error"
                                                size="small"
                                            />
                                            <Chip
                                                label={`${previewResult.summary.rulesModified} Modified`}
                                                color="warning"
                                                size="small"
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <Typography variant="subtitle2">
                                            Warnings Impact
                                        </Typography>
                                        <Alert severity="success" sx={{ mt: 1 }}>
                                            {previewResult.summary.warningsResolved} warnings will be resolved
                                        </Alert>
                                        {previewResult.remainingWarnings.length > 0 && (
                                            <Alert severity="warning" sx={{ mt: 1 }}>
                                                {previewResult.remainingWarnings.length} warnings will remain
                                            </Alert>
                                        )}
                                    </Box>
                                </Box>
                            </Paper>
                        ) : (
                            <Alert severity="info">
                                Select fixes to see their combined impact
                            </Alert>
                        )}
                    </Grid>
                    </Grid>
                    <Grid item xs={4}>
                        <ResolutionHistory currentSessionId={sessionId} />
                    </Grid>
                    </Grid>
                    <Grid item xs={4}>
                        <ResolutionHistory currentSessionId={sessionId} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {resolutionResult && (
                    <Button
                        onClick={handleAutoResolve}
                        color="info"
                    >
                        Auto-Resolve
                    </Button>
                )}
                <Button
                    onClick={handleApplyBatch}
                    variant="contained"
                    disabled={selectedFixes.size === 0}
                >
                    Apply Selected Fixes
                </Button>
            </DialogActions>
        </Dialog>
    );
};
