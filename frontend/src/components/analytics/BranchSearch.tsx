import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Autocomplete,
    Chip,
    IconButton,
    Popover,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    Typography,
    Button
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

interface SearchFilters {
    branches: string[];
    tags: string[];
    dateRange: [Date | null, Date | null];
    authors: string[];
}

interface BranchSearchProps {
    commits: any[];
    onSearch: (query: string) => void;
    onFilter: (filters: SearchFilters) => void;
}

export const BranchSearch: React.FC<BranchSearchProps> = ({
    commits,
    onSearch,
    onFilter
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        branches: [],
        tags: [],
        dateRange: [null, null],
        authors: []
    });
    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

    const branches = Array.from(new Set(commits.map(c => c.branch)));
    const tags = Array.from(new Set(commits.flatMap(c => c.tags)));
    const authors = Array.from(new Set(commits.map(c => c.author)));

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    const handleFilterChange = (type: keyof SearchFilters, value: any) => {
        const newFilters = { ...filters, [type]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleClearFilters = () => {
        const emptyFilters: SearchFilters = {
            branches: [],
            tags: [],
            dateRange: [null, null],
            authors: []
        };
        setFilters(emptyFilters);
        onFilter(emptyFilters);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box display="flex" gap={1}>
                <Autocomplete
                    freeSolo
                    options={[]}
                    value={searchQuery}
                    onChange={(_, value) => handleSearch(value || '')}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            placeholder="Search commits..."
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                            }}
                        />
                    )}
                    sx={{ flex: 1 }}
                />
                <IconButton
                    onClick={(e) => setFilterAnchor(e.currentTarget)}
                    color={Object.values(filters).some(f => 
                        Array.isArray(f) ? f.length > 0 : f
                    ) ? "primary" : "default"}
                >
                    <FilterIcon />
                </IconButton>
            </Box>

            {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f) && (
                <Box display="flex" gap={1} mt={1}>
                    {filters.branches.map(branch => (
                        <Chip
                            key={branch}
                            label={`Branch: ${branch}`}
                            onDelete={() => handleFilterChange(
                                'branches',
                                filters.branches.filter(b => b !== branch)
                            )}
                            size="small"
                        />
                    ))}
                    {filters.tags.map(tag => (
                        <Chip
                            key={tag}
                            label={`Tag: ${tag}`}
                            onDelete={() => handleFilterChange(
                                'tags',
                                filters.tags.filter(t => t !== tag)
                            )}
                            size="small"
                        />
                    ))}
                    {filters.authors.map(author => (
                        <Chip
                            key={author}
                            label={`Author: ${author}`}
                            onDelete={() => handleFilterChange(
                                'authors',
                                filters.authors.filter(a => a !== author)
                            )}
                            size="small"
                        />
                    ))}
                    <Button
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={handleClearFilters}
                    >
                        Clear All
                    </Button>
                </Box>
            )}

            <Popover
                open={Boolean(filterAnchor)}
                anchorEl={filterAnchor}
                onClose={() => setFilterAnchor(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ width: 300, p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Branches
                    </Typography>
                    <List dense>
                        {branches.map(branch => (
                            <ListItem
                                key={branch}
                                onClick={() => handleFilterChange(
                                    'branches',
                                    filters.branches.includes(branch)
                                        ? filters.branches.filter(b => b !== branch)
                                        : [...filters.branches, branch]
                                )}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={filters.branches.includes(branch)}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText primary={branch} />
                            </ListItem>
                        ))}
                    </List>

                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Tags
                    </Typography>
                    <List dense>
                        {tags.map(tag => (
                            <ListItem
                                key={tag}
                                onClick={() => handleFilterChange(
                                    'tags',
                                    filters.tags.includes(tag)
                                        ? filters.tags.filter(t => t !== tag)
                                        : [...filters.tags, tag]
                                )}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={filters.tags.includes(tag)}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                </ListItemIcon>
                                <ListItemText primary={tag} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Popover>
        </Box>
    );
};