import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Box,
    SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface AnalyticsFiltersProps {
    filters: {
        dateRange: {
            start: Date | null;
            end: Date | null;
        };
        industry: string;
        mentoringStyle: string;
        goalCategory: string;
    };
    onFilterChange: (name: string, value: any) => void;
    onApplyFilters: () => void;
    onResetFilters: () => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
    filters,
    onFilterChange,
    onApplyFilters,
    onResetFilters
}) => {
    const handleDateChange = (type: 'start' | 'end') => (date: Date | null) => {
        onFilterChange('dateRange', {
            ...filters.dateRange,
            [type]: date
        });
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        onFilterChange(event.target.name, event.target.value);
    };

    return (
        <Card>
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <DatePicker
                                        label="Start Date"
                                        value={filters.dateRange.start}
                                        onChange={handleDateChange('start')}
                                        slotProps={{
                                            textField: { fullWidth: true }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <DatePicker
                                        label="End Date"
                                        value={filters.dateRange.end}
                                        onChange={handleDateChange('end')}
                                        slotProps={{
                                            textField: { fullWidth: true }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Industry</InputLabel>
                                    <Select
                                        name="industry"
                                        value={filters.industry}
                                        onChange={handleSelectChange}
                                        label="Industry"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="software">Software</MenuItem>
                                        <MenuItem value="finance">Finance</MenuItem>
                                        <MenuItem value="healthcare">Healthcare</MenuItem>
                                        <MenuItem value="education">Education</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Mentoring Style</InputLabel>
                                    <Select
                                        name="mentoringStyle"
                                        value={filters.mentoringStyle}
                                        onChange={handleSelectChange}
                                        label="Mentoring Style"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="directive">Directive</MenuItem>
                                        <MenuItem value="collaborative">Collaborative</MenuItem>
                                        <MenuItem value="supportive">Supportive</MenuItem>
                                        <MenuItem value="challenging">Challenging</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Goal Category</InputLabel>
                                    <Select
                                        name="goalCategory"
                                        value={filters.goalCategory}
                                        onChange={handleSelectChange}
                                        label="Goal Category"
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="technical">Technical</MenuItem>
                                        <MenuItem value="leadership">Leadership</MenuItem>
                                        <MenuItem value="career">Career Growth</MenuItem>
                                        <MenuItem value="soft-skills">Soft Skills</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            <Button
                                variant="outlined"
                                onClick={onResetFilters}
                            >
                                Reset Filters
                            </Button>
                            <Button
                                variant="contained"
                                onClick={onApplyFilters}
                            >
                                Apply Filters
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};