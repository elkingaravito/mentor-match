import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondary,
    Chip,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    AutoFix as AutoFixIcon,
    Info as InfoIcon,
    BatchPrediction as BatchPredictionIcon
} from '@mui/icons-material';
import { BatchFixDialog } from './BatchFixDialog';
import { ValidationWarning } from '../../services/RuleValidationService';
import { FixSuggestion, RuleAutoFixService } from '../../services/RuleAutoFixService';
import { ConditionalRule } from './ConditionalFormatting';
import { FixHistoryManager } from '../../services/FixHistoryManager';
import { BatchFixDialog } from './BatchFixDialog';

interface AutoFixSuggestionsProps {
    warning: ValidationWarning;
    rules: ConditionalRule[];
    onApplyFix: (newRules: ConditionalRule[]) => void;
}

export const AutoFixSuggestions: React.FC<AutoFixSuggestionsProps> = ({
    warning,
    rules,
    onApplyFix
}) => {
    const [previewFix, setPreviewFix] = useState<FixSuggestion | null>(null);
    const [batchFixOpen, setBatchFixOpen] = useState(false);
    const [historyManager] = useState(() => new FixHistoryManager(rules));

    const handleApplyFix = (fix: FixSuggestion) => {
        const newRules = fix.apply(rules);
        historyManager.push(newRules, fix.description);
        onApplyFix(newRules);
    };

    const handleBatchApply = (newRules: ConditionalRule[]) => {
        historyManager.push(newRules, "Batch fixes applied");
        onApplyFix(newRules);
        setBatchFixOpen(false);
    };

    const handleUndo = () => {
        const previousState = historyManager.undo();
        if (previousState) {
            onApplyFix(previousState.rules);
        }
    };

    const handleRedo = () => {
        const nextState = historyManager.redo();
        if (nextState) {
            onApplyFix(nextState.rules);
        }
    };
    const fixes = RuleAutoFixService.generateFixes(warning, rules);

    if (fixes.length === 0) return null;

    return (
        <Card variant="outlined">
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AutoFixIcon color="info" />
                        <Typography variant="subtitle2">
                            Available Fixes
                        </Typography>
                    </Box>
                    <Box>
                        <Tooltip title="Undo">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handleUndo}
                                    disabled={!historyManager.canUndo()}
                                >
                                    <UndoIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Redo">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={handleRedo}
                                    disabled={!historyManager.canRedo()}
                                >
                                    <RedoIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                </Box>

                <List dense>
                    {fixes.map((fix) => (
                        <React.Fragment key={fix.id}>
                            <ListItem
                                secondaryAction={
                                    <Box>
                                        <Button
                                            size="small"
                                            onClick={() => setPreviewFix(fix)}
                                            sx={{ mr: 1 }}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleApplyFix(fix)}
                                        >
                                            Apply Fix
                                        </Button>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={fix.description}
                                    secondary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip
                                                size="small"
                                                label="Impact"
                                                color="warning"
                                            />
                                            <Typography variant="caption">
                                                {fix.impact}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </CardContent>
        <>
            <Card variant="outlined">
                <CardContent>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                        spacing={2}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            <AutoFixIcon color="info" />
                            <Typography variant="subtitle2">
                                Available Fixes
                            </Typography>
                        </Box>
                        {fixes.length > 1 && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setBatchFixOpen(true)}
                                startIcon={<BatchPredictionIcon />}
                            >
                                Batch Fix
                            </Button>
                        )}
                    </Stack>

                    <List dense>
                        {fixes.map((fix) => (
                            <React.Fragment key={fix.id}>
                                <ListItem
                                    secondaryAction={
                                        <Box>
                                            <Button
                                                size="small"
                                                onClick={() => setPreviewFix(fix)}
                                                sx={{ mr: 1 }}
                                            >
                                                Preview
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleApplyFix(fix)}
                                            >
                                                Apply Fix
                                            </Button>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary={fix.description}
                                        secondary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Chip
                                                    size="small"
                                                    label="Impact"
                                                    color="warning"
                                                />
                                                <Typography variant="caption">
                                                    {fix.impact}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {batchFixOpen && (
                <BatchFixDialog
                    open={batchFixOpen}
                    onClose={() => setBatchFixOpen(false)}
                    onApply={handleBatchApply}
                    currentRules={rules}
                    availableFixes={fixes}
                    currentWarnings={[warning]}
                />
            )}

            {previewFix && (
                <FixPreview
                    open={true}
                    onClose={() => setPreviewFix(null)}
                    onApply={() => {
                        handleApplyFix(previewFix);
                        setPreviewFix(null);
                    }}
                    currentRules={rules}
                    fixedRules={previewFix.apply(rules)}
                    fix={previewFix}
                />
            )}
        </>
    );
};
