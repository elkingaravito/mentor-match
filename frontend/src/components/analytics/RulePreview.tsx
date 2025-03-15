import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    IconButton,
    Tooltip,
    Chip,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    PlayArrow as TestIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { ConditionalRule } from './ConditionalFormatting';

interface RulePreviewProps {
    columnType: 'text' | 'number' | 'date' | 'status';
    rules: ConditionalRule[];
    onSaveTestCase: (value: any) => void;
}

interface TestCase {
    value: any;
    expectedStyle: any;
}

export const RulePreview: React.FC<RulePreviewProps> = ({
    columnType,
    rules,
    onSaveTestCase
}) => {
    const [testValue, setTestValue] = useState<string>('');
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [previewData, setPreviewData] = useState<any[]>([]);

    const generateSampleData = () => {
        const samples: any[] = [];
        
        switch (columnType) {
            case 'number':
                samples.push(
                    0, 50, 100, -10, 1000,
                    ...rules.map(rule => rule.value1),
                    ...rules.filter(r => r.value2).map(rule => rule.value2!)
                );
                break;
            
            case 'date':
                samples.push(
                    new Date().toISOString(),
                    new Date(Date.now() - 86400000).toISOString(), // yesterday
                    new Date(Date.now() + 86400000).toISOString(), // tomorrow
                    ...rules.map(rule => rule.value1)
                );
                break;
            
            case 'status':
                samples.push(
                    'Active', 'Pending', 'Completed', 'Failed',
                    ...rules.map(rule => rule.value1)
                );
                break;
            
            default:
                samples.push(
                    'Sample Text',
                    'Another Example',
                    ...rules.map(rule => rule.value1)
                );
        }

        setPreviewData(Array.from(new Set(samples)));
    };

    const evaluateRule = (value: any): any => {
        for (const rule of rules) {
            let matches = false;
            const testValue = columnType === 'number' ? Number(value) : value;

            switch (rule.operator) {
                case 'equals':
                    matches = testValue === rule.value1;
                    break;
                case 'notEquals':
                    matches = testValue !== rule.value1;
                    break;
                case 'greaterThan':
                    matches = testValue > rule.value1;
                    break;
                case 'lessThan':
                    matches = testValue < rule.value1;
                    break;
                case 'between':
                    matches = testValue >= rule.value1 && testValue <= rule.value2!;
                    break;
                case 'contains':
                    matches = String(testValue).includes(String(rule.value1));
                    break;
                case 'notContains':
                    matches = !String(testValue).includes(String(rule.value1));
                    break;
            }

            if (matches) {
                return rule.style;
            }
        }
        return null;
    };

    const handleAddTestCase = () => {
        const style = evaluateRule(testValue);
        setTestCases([...testCases, { value: testValue, expectedStyle: style }]);
        setTestValue('');
    };

    const handleRemoveTestCase = (index: number) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box display="flex" gap={1} mb={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Test Value"
                            value={testValue}
                            onChange={(e) => setTestValue(e.target.value)}
                            type={columnType === 'number' ? 'number' : 'text'}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddTestCase}
                            startIcon={<AddIcon />}
                        >
                            Add Test
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={generateSampleData}
                            startIcon={<TestIcon />}
                        >
                            Generate Samples
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                        Test Cases
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Applied Style</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {testCases.map((testCase, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{testCase.value}</TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                {testCase.expectedStyle ? (
                                                    <>
                                                        <Chip
                                                            size="small"
                                                            label="Style Preview"
                                                            style={{
                                                                backgroundColor: testCase.expectedStyle.backgroundColor,
                                                                color: testCase.expectedStyle.textColor,
                                                                fontWeight: testCase.expectedStyle.bold ? 'bold' : 'normal',
                                                                fontStyle: testCase.expectedStyle.italic ? 'italic' : 'normal'
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <Typography variant="caption" color="textSecondary">
                                                        No style applied
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveTestCase(index)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => onSaveTestCase(testCase)}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                        Sample Data Preview
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Value</TableCell>
                                    <TableCell>Applied Style</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {previewData.map((value, index) => {
                                    const style = evaluateRule(value);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>{value}</TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    {style ? (
                                                        <Chip
                                                            size="small"
                                                            label="Preview"
                                                            style={{
                                                                backgroundColor: style.backgroundColor,
                                                                color: style.textColor,
                                                                fontWeight: style.bold ? 'bold' : 'normal',
                                                                fontStyle: style.italic ? 'italic' : 'normal'
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" color="textSecondary">
                                                            Default style
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    );
};