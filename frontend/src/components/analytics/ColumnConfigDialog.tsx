import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';

export interface ColumnConfig {
    width: number;
    alignment: 'left' | 'center' | 'right';
    format?: string;
    numberFormat?: {
        decimals: number;
        showThousandsSeparator: boolean;
        prefix?: string;
        suffix?: string;
    };
    dateFormat?: string;
    wrap: boolean;
    minWidth?: number;
    maxWidth?: number;
    headerStyle?: {
        bold: boolean;
        italic: boolean;
    };
    conditionalRules?: ConditionalRule[];
}

interface ColumnConfigDialogProps {
    open: boolean;
    onClose: () => void;
    column: {
        id: string;
        name: string;
        config: ColumnConfig;
    };
    onSave: (columnId: string, config: ColumnConfig) => void;
}

export const ColumnConfigDialog: React.FC<ColumnConfigDialogProps> = ({
    open,
    onClose,
    column,
    onSave
}) => {
    const [config, setConfig] = useState<ColumnConfig>(column.config);

    const handleSave = () => {
        onSave(column.id, config);
        onClose();
    };

    const isNumericColumn = column.id.includes('score') || 
                           column.id.includes('duration') || 
                           column.id.includes('progress');

    const isDateColumn = column.id.includes('date') || 
                        column.id.includes('session') || 
                        column.id.includes('created');

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Configure Column: {column.name}</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Basic Configuration
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Width (px)"
                            value={config.width}
                            onChange={(e) => setConfig({
                                ...config,
                                width: parseInt(e.target.value)
                            })}
                            InputProps={{ inputProps: { min: 50, max: 500 } }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Alignment</InputLabel>
                            <Select
                                value={config.alignment}
                                onChange={(e) => setConfig({
                                    ...config,
                                    alignment: e.target.value as 'left' | 'center' | 'right'
                                })}
                                label="Alignment"
                            >
                                <MenuItem value="left">Left</MenuItem>
                                <MenuItem value="center">Center</MenuItem>
                                <MenuItem value="right">Right</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {isNumericColumn && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Number Formatting
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Decimal Places"
                                    value={config.numberFormat?.decimals}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        numberFormat: {
                                            ...config.numberFormat!,
                                            decimals: parseInt(e.target.value)
                                        }
                                    })}
                                    InputProps={{ inputProps: { min: 0, max: 5 } }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={config.numberFormat?.showThousandsSeparator}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                numberFormat: {
                                                    ...config.numberFormat!,
                                                    showThousandsSeparator: e.target.checked
                                                }
                                            })}
                                        />
                                    }
                                    label="Show Thousands Separator"
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Prefix"
                                    value={config.numberFormat?.prefix}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        numberFormat: {
                                            ...config.numberFormat!,
                                            prefix: e.target.value
                                        }
                                    })}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Suffix"
                                    value={config.numberFormat?.suffix}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        numberFormat: {
                                            ...config.numberFormat!,
                                            suffix: e.target.value
                                        }
                                    })}
                                />
                            </Grid>
                        </>
                    )}

                    {isDateColumn && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Date Formatting
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Date Format</InputLabel>
                                    <Select
                                        value={config.dateFormat}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            dateFormat: e.target.value as string
                                        })}
                                        label="Date Format"
                                    >
                                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                                        <MenuItem value="MMM DD, YYYY">MMM DD, YYYY</MenuItem>
                                        <MenuItem value="MMMM DD, YYYY">MMMM DD, YYYY</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Conditional Formatting
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <ConditionalFormatting
                            rules={config.conditionalRules || []}
                            onChange={(rules) => setConfig({
                                ...config,
                                conditionalRules: rules
                            })}
                            columnType={
                                isNumericColumn ? 'number' :
                                isDateColumn ? 'date' :
                                column.id.includes('status') ? 'status' : 'text'
                            }
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                            Advanced Options
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={config.wrap}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        wrap: e.target.checked
                                    })}
                                />
                            }
                            label="Allow Text Wrapping"
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Minimum Width (px)"
                            value={config.minWidth}
                            onChange={(e) => setConfig({
                                ...config,
                                minWidth: parseInt(e.target.value)
                            })}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Maximum Width (px)"
                            value={config.maxWidth}
                            onChange={(e) => setConfig({
                                ...config,
                                maxWidth: parseInt(e.target.value)
                            })}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">
                    Save Configuration
                </Button>
            </DialogActions>
        </Dialog>
    );
};
