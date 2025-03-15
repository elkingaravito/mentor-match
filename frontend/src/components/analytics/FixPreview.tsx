import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Grid
} from '@mui/material';
import { ConditionalRule } from './ConditionalFormatting';
import { FixSuggestion } from '../../services/RuleAutoFixService';

interface FixPreviewProps {
    open: boolean;
    onClose: () => void;
    onApply: () => void;
    currentRules: ConditionalRule[];
    fixedRules: ConditionalRule[];
    fix: FixSuggestion;
}

export const FixPreview: React.FC<FixPreviewProps> = ({
    open,
    onClose,
    onApply,
    currentRules,
    fixedRules,
    fix
}) => {
    const renderRulePreview = (rule: ConditionalRule) => (
        <Box
            sx={{
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: rule.style.backgroundColor,
                color: rule.style.textColor
            }}
        >
            <Typography variant="body2" fontWeight={rule.style.bold ? 'bold' : 'normal'}>
                {rule.operator} {rule.value1}
                {rule.value2 && ` to ${rule.value2}`}
            </Typography>
        </Box>
    );

    const findChangedRules = () => {
        const added = fixedRules.filter(
            fixed => !currentRules.find(current => current.id === fixed.id)
        );
        const removed = currentRules.filter(
            current => !fixedRules.find(fixed => fixed.id === current.id)
        );
        const modified = fixedRules.filter(fixed => 
            currentRules.find(current => 
                current.id === fixed.id && 
                JSON.stringify(current) !== JSON.stringify(fixed)
            )
        );

        return { added, removed, modified };
    };

    const changes = findChangedRules();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Preview Fix: {fix.description}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Impact: {fix.impact}
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Current Rules
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {currentRules.map((rule) => (
                                <Box key={rule.id} mb={1}>
                                    {renderRulePreview(rule)}
                                </Box>
                            ))}
                        </Paper>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            After Fix
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {fixedRules.map((rule) => (
                                <Box key={rule.id} mb={1}>
                                    {renderRulePreview(rule)}
                                </Box>
                            ))}
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            Changes Summary
                        </Typography>
                        <Box display="flex" gap={1} mb={2}>
                            {changes.added.length > 0 && (
                                <Chip
                                    label={`${changes.added.length} rules added`}
                                    color="success"
                                    size="small"
                                />
                            )}
                            {changes.removed.length > 0 && (
                                <Chip
                                    label={`${changes.removed.length} rules removed`}
                                    color="error"
                                    size="small"
                                />
                            )}
                            {changes.modified.length > 0 && (
                                <Chip
                                    label={`${changes.modified.length} rules modified`}
                                    color="warning"
                                    size="small"
                                />
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onApply} variant="contained" color="primary">
                    Apply Fix
                </Button>
            </DialogActions>
        </Dialog>
    );
};