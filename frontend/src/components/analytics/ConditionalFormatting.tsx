import React, { useState, useEffect } from 'react';
import { RuleValidationService, ValidationWarning } from '../../services/RuleValidationService';
import {
    Box,
    Button,
    Grid,
    Typography,
    Paper,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondary,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ChromePicker } from 'react-color';

export interface ConditionalRule {
    id: string;
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between' | 'contains' | 'notContains';
    value1: string | number;
    value2?: string | number;
    style: {
        backgroundColor?: string;
        textColor?: string;
        bold?: boolean;
        italic?: boolean;
        icon?: string;
    };
}

interface ConditionalFormattingProps {
    rules: ConditionalRule[];
    onChange: (rules: ConditionalRule[]) => void;
    columnType: 'text' | 'number' | 'date' | 'status';
}

export const ConditionalFormatting: React.FC<ConditionalFormattingProps> = ({
    rules,
    onChange,
    columnType
}) => {
    const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);

    useEffect(() => {
        const warnings = RuleValidationService.validateRules(rules, columnType);
        setValidationWarnings(warnings);
    }, [rules, columnType]);

    const getWarningsForRule = (ruleId: string): ValidationWarning[] => {
        return validationWarnings.filter(warning => warning.ruleIds.includes(ruleId));
    };
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    const getOperators = () => {
        const baseOperators = [
            { value: 'equals', label: 'Equals' },
            { value: 'notEquals', label: 'Not Equals' },
            { value: 'contains', label: 'Contains' },
            { value: 'notContains', label: 'Does Not Contain' }
        ];

        const numericOperators = [
            { value: 'greaterThan', label: 'Greater Than' },
            { value: 'lessThan', label: 'Less Than' },
            { value: 'between', label: 'Between' }
        ];

        switch (columnType) {
            case 'number':
                return [...baseOperators, ...numericOperators];
            case 'date':
                return [...baseOperators, ...numericOperators];
            case 'status':
                return baseOperators;
            default:
                return baseOperators;
        }
    };

    const handleAddRule = () => {
        const newRule: ConditionalRule = {
            id: `rule-${Date.now()}`,
            operator: 'equals',
            value1: '',
            style: {
                backgroundColor: '#ffffff',
                textColor: '#000000'
            }
        };
        onChange([...rules, newRule]);
    };

    const handleDeleteRule = (ruleId: string) => {
        onChange(rules.filter(rule => rule.id !== ruleId));
    };

    const handleRuleChange = (ruleId: string, field: string, value: any) => {
        onChange(rules.map(rule => 
            rule.id === ruleId ? { ...rule, [field]: value } : rule
        ));
    };

    const handleStyleChange = (ruleId: string, styleField: string, value: any) => {
        onChange(rules.map(rule =>
            rule.id === ruleId ? {
                ...rule,
                style: { ...rule.style, [styleField]: value }
            } : rule
        ));
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(rules);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onChange(items);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">Conditional Formatting Rules</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={handleAddRule}
                >
                    Add Rule
                </Button>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="rules">
                    {(provided) => (
                        <List {...provided.droppableProps} ref={provided.innerRef}>
                            {rules.map((rule, index) => (
                                <Draggable
                                    key={rule.id}
                                    draggableId={rule.id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <ListItem
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            component={Paper}
                                            variant="outlined"
                                            sx={{ 
                                                mb: 1,
                                                border: (theme) => {
                                                    const ruleWarnings = getWarningsForRule(rule.id);
                                                    if (ruleWarnings.some(w => w.type === 'error')) {
                                                        return `1px solid ${theme.palette.error.main}`;
                                                    }
                                                    if (ruleWarnings.some(w => w.type === 'warning')) {
                                                        return `1px solid ${theme.palette.warning.main}`;
                                                    }
                                                    return undefined;
                                                }
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item {...provided.dragHandleProps}>
                                                    <DragIndicatorIcon />
                                                </Grid>

                                                <Grid item xs={3}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Condition</InputLabel>
                                                        <Select
                                                            value={rule.operator}
                                                            onChange={(e) => handleRuleChange(rule.id, 'operator', e.target.value)}
                                                            label="Condition"
                                                        >
                                                            {getOperators().map(op => (
                                                                <MenuItem key={op.value} value={op.value}>
                                                                    {op.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={3}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Value"
                                                        value={rule.value1}
                                                        onChange={(e) => handleRuleChange(rule.id, 'value1', e.target.value)}
                                                        type={columnType === 'number' ? 'number' : 'text'}
                                                    />
                                                </Grid>

                                                {rule.operator === 'between' && (
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Value 2"
                                                            value={rule.value2 || ''}
                                                            onChange={(e) => handleRuleChange(rule.id, 'value2', e.target.value)}
                                                            type={columnType === 'number' ? 'number' : 'text'}
                                                        />
                                                    </Grid>
                                                )}

                                                <Grid item xs={rule.operator === 'between' ? 2 : 5}>
                                                    <Box display="flex" gap={1}>
                                                        <Button
                                                            size="small"
                                                            onClick={() => setShowColorPicker(rule.id)}
                                                            style={{
                                                                backgroundColor: rule.style.backgroundColor,
                                                                color: rule.style.textColor,
                                                                minWidth: 'auto'
                                                            }}
                                                        >
                                                            ABC
                                                        </Button>
                                                        {showColorPicker === rule.id && (
                                                            <Box position="absolute" zIndex={1}>
                                                                <Paper>
                                                                    <ChromePicker
                                                                        color={rule.style.backgroundColor}
                                                                        onChange={(color) => {
                                                                            handleStyleChange(rule.id, 'backgroundColor', color.hex);
                                                                        }}
                                                                    />
                                                                </Paper>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={1}>
                                                    <Box display="flex" gap={1}>
                                                        {getWarningsForRule(rule.id).map((warning, idx) => (
                                                            <Tooltip
                                                                key={idx}
                                                                title={
                                                                    <Box>
                                                                        <Typography variant="subtitle2">
                                                                            {warning.message}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            {warning.description}
                                                                        </Typography>
                                                                        {warning.suggestion && (
                                                                            <Typography variant="body2" color="info.main">
                                                                                Suggestion: {warning.suggestion}
                                                                            </Typography>
                                                                        )}
                                                                    </Box>
                                                                }
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    color={warning.type === 'error' ? 'error' : 'warning'}
                                                                >
                                                                    {warning.type === 'error' ? (
                                                                        <ErrorIcon fontSize="small" />
                                                                    ) : (
                                                                        <WarningIcon fontSize="small" />
                                                                    )}
                                                                </IconButton>
                                                            </Tooltip>
                                                        ))}
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteRule(rule.id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </List>
                    )}
                </Droppable>
            </DragDropContext>

            <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                    Rule Testing & Preview
                </Typography>
                <RulePreview
                    columnType={columnType}
                    rules={rules}
                    onSaveTestCase={(testCase) => {
                        // Save test case for future reference
                        console.log('Test case saved:', testCase);
                    }}
                />
            </Box>

            {validationWarnings.length > 0 && (
                <Box mt={2}>
                    <Paper
                        sx={{
                            p: 2,
                            backgroundColor: (theme) => 
                                validationWarnings.some(w => w.type === 'error')
                                    ? theme.palette.error.light
                                    : theme.palette.warning.light
                        }}
                    >
                        <Typography variant="subtitle2" gutterBottom>
                            Validation Issues Found
                        </Typography>
                        <List dense>
                            {validationWarnings.map((warning, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemIcon>
                                            {warning.type === 'error' ? (
                                                <ErrorIcon color="error" />
                                            ) : (
                                                <WarningIcon color="warning" />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={warning.message}
                                            secondary={warning.description}
                                        />
                                    </ListItem>
                                    <Box ml={7} mb={2}>
                                        <AutoFixSuggestions
                                            warning={warning}
                                            rules={rules}
                                            onApplyFix={(newRules) => {
                                                onChange(newRules);
                                            }}
                                        />
                                    </Box>
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Validation Issues Found
                    </Typography>
                    <List dense>
                        {validationWarnings.map((warning, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    {warning.type === 'error' ? (
                                        <ErrorIcon color="error" />
                                    ) : (
                                        <WarningIcon color="warning" />
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={warning.message}
                                    secondary={
                                        <>
                                            {warning.description}
                                            {warning.suggestion && (
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="info.main"
                                                    display="block"
                                                >
                                                    Suggestion: {warning.suggestion}
                                                </Typography>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            <Box mt={2}>
                <Typography variant="caption" color="textSecondary">
                    Rules are applied in order. First matching rule takes precedence.
                </Typography>
            </Box>
        </Box>
    );
};
