import React from 'react';
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Sort as SortIcon,
    SortByAlpha as SortByAlphaIcon,
    AccessTime as TimeIcon,
    Label as TagIcon
} from '@mui/icons-material';
import { SortField, SortOrder, GroupBy } from '../../services/activityOrganizer';

interface ActivityOrganizerProps {
    sortField: SortField;
    sortOrder: SortOrder;
    groupBy: GroupBy;
    onSortChange: (field: SortField, order: SortOrder) => void;
    onGroupChange: (groupBy: GroupBy) => void;
}

export const ActivityOrganizer: React.FC<ActivityOrganizerProps> = ({
    sortField,
    sortOrder,
    groupBy,
    onSortChange,
    onGroupChange
}) => {
    const theme = useTheme();

    const handleSortFieldChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        onSortChange(event.target.value as SortField, sortOrder);
    };

    const handleSortOrderChange = () => {
        onSortChange(sortField, sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleGroupChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        onGroupChange(event.target.value as GroupBy);
    };

    return (
        <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: 1,
            borderColor: 'divider'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Sort by:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={sortField}
                        onChange={handleSortFieldChange}
                        displayEmpty
                    >
                        <MenuItem value="timestamp">Time</MenuItem>
                        <MenuItem value="type">Type</MenuItem>
                        <MenuItem value="status">Status</MenuItem>
                    </Select>
                </FormControl>
                <Tooltip title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}>
                    <ToggleButton
                        value="sort"
                        selected={sortOrder === 'desc'}
                        onChange={handleSortOrderChange}
                        size="small"
                    >
                        <SortIcon
                            sx={{
                                transform: sortOrder === 'desc' ? 'scaleY(-1)' : 'none'
                            }}
                        />
                    </ToggleButton>
                </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    Group by:
                </Typography>
                <ToggleButtonGroup
                    value={groupBy}
                    exclusive
                    onChange={(_, value) => value && onGroupChange(value)}
                    size="small"
                >
                    <ToggleButton value="none">
                        <Tooltip title="No grouping">
                            <SortByAlphaIcon />
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="date">
                        <Tooltip title="Group by date">
                            <TimeIcon />
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="tags">
                        <Tooltip title="Group by tags">
                            <TagIcon />
                        </Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
        </Box>
    );
};