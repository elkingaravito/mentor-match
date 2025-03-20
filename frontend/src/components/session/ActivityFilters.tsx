import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    Tooltip,
    Badge,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Typography,
    Divider,
    useTheme
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Code as CodeIcon,
    QuestionAnswer as QuestionIcon,
    Note as NoteIcon,
    Feedback as FeedbackIcon,
    Link as ResourceIcon
} from '@mui/icons-material';
import { SessionActivity } from '../../services/sessionActivity';

export interface ActivityFilters {
    search: string;
    types: SessionActivity['type'][];
    status?: 'pending' | 'resolved' | null;
    tags: string[];
    dateRange?: {
        start: Date;
        end: Date;
    } | null;
}

interface ActivityFiltersProps {
    filters: ActivityFilters;
    onFiltersChange: (filters: ActivityFilters) => void;
    availableTags: string[];
}

const ACTIVITY_TYPES: { type: SessionActivity['type']; label: string; icon: JSX.Element }[] = [
    { type: 'code', label: 'Code Snippets', icon: <CodeIcon /> },
    { type: 'question', label: 'Questions', icon: <QuestionIcon /> },
    { type: 'note', label: 'Notes', icon: <NoteIcon /> },
    { type: 'feedback', label: 'Feedback', icon: <FeedbackIcon /> },
    { type: 'resource', label: 'Resources', icon: <ResourceIcon /> }
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
    filters,
    onFiltersChange,
    availableTags
}) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [tagAnchorEl, setTagAnchorEl] = useState<null | HTMLElement>(null);

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleTagClick = (event: React.MouseEvent<HTMLElement>) => {
        setTagAnchorEl(event.currentTarget);
    };

    const handleTypeToggle = (type: SessionActivity['type']) => {
        const newTypes = filters.types.includes(type)
            ? filters.types.filter(t => t !== type)
            : [...filters.types, type];
        onFiltersChange({ ...filters, types: newTypes });
    };

    const handleStatusChange = (status: ActivityFilters['status']) => {
        onFiltersChange({ ...filters, status });
    };

    const handleTagToggle = (tag: string) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        onFiltersChange({ ...filters, tags: newTags });
    };

    const handleClearFilters = () => {
        onFiltersChange({
            search: '',
            types: [],
            status: null,
            tags: [],
            dateRange: null
        });
    };

    const activeFiltersCount = 
        (filters.types.length > 0 ? 1 : 0) +
        (filters.status ? 1 : 0) +
        filters.tags.length +
        (filters.dateRange ? 1 : 0);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}
        >
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search activities..."
                    value={filters.search}
                    onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                        endAdornment: filters.search && (
                            <IconButton
                                size="small"
                                onClick={() => onFiltersChange({ ...filters, search: '' })}
                            >
                                <ClearIcon />
                            </IconButton>
                        )
                    }}
                />
                <Tooltip title="Filters">
                    <IconButton onClick={handleFilterClick}>
                        <Badge badgeContent={activeFiltersCount} color="primary">
                            <FilterIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>
            </Box>

            {(filters.types.length > 0 || filters.tags.length > 0) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filters.types.map((type) => (
                        <Chip
                            key={type}
                            label={ACTIVITY_TYPES.find(t => t.type === type)?.label}
                            onDelete={() => handleTypeToggle(type)}
                            icon={ACTIVITY_TYPES.find(t => t.type === type)?.icon}
                        />
                    ))}
                    {filters.tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => handleTagToggle(tag)}
                        />
                    ))}
                    {(filters.types.length > 0 || filters.tags.length > 0) && (
                        <Chip
                            label="Clear all"
                            onDelete={handleClearFilters}
                            deleteIcon={<ClearIcon />}
                        />
                    )}
                </Box>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <Box sx={{ p: 2, minWidth: 250 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Activity Types
                    </Typography>
                    <FormGroup>
                        {ACTIVITY_TYPES.map(({ type, label, icon }) => (
                            <FormControlLabel
                                key={type}
                                control={
                                    <Checkbox
                                        checked={filters.types.includes(type)}
                                        onChange={() => handleTypeToggle(type)}
                                        icon={icon}
                                        checkedIcon={icon}
                                    />
                                }
                                label={label}
                            />
                        ))}
                    </FormGroup>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                        Status
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.status === 'pending'}
                                    onChange={() => handleStatusChange(
                                        filters.status === 'pending' ? null : 'pending'
                                    )}
                                />
                            }
                            label="Pending"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.status === 'resolved'}
                                    onChange={() => handleStatusChange(
                                        filters.status === 'resolved' ? null : 'resolved'
                                    )}
                                />
                            }
                            label="Resolved"
                        />
                    </FormGroup>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                            Tags
                        </Typography>
                        <Chip
                            label={`${availableTags.length} available`}
                            size="small"
                            onClick={handleTagClick}
                        />
                    </Box>
                </Box>
            </Menu>

            <Menu
                anchorEl={tagAnchorEl}
                open={Boolean(tagAnchorEl)}
                onClose={() => setTagAnchorEl(null)}
            >
                <Box sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
                    {availableTags.map((tag) => (
                        <MenuItem
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            selected={filters.tags.includes(tag)}
                        >
                            {tag}
                        </MenuItem>
                    ))}
                </Box>
            </Menu>
        </Paper>
    );
};