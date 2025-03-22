import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Rating,
    Tooltip,
    Alert,
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Sort as SortIcon,
    MoreVert as MoreVertIcon,
    Check as CheckIcon,
    Block as BlockIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { MentorProfile, MentorStatus, MentorFilter, MentorSort } from '../../types/mentor';
import { useConfirmDialog } from '../feedback/ConfirmDialog';
import { useToast } from '../feedback/Toast';

interface MentorManagementProps {
    onStatusChange: (mentorId: number, status: MentorStatus) => Promise<void>;
    onDelete: (mentorId: number) => Promise<void>;
    onEdit: (mentor: MentorProfile) => void;
}

export const MentorManagement: React.FC<MentorManagementProps> = ({
    onStatusChange,
    onDelete,
    onEdit,
}) => {
    const [filters, setFilters] = useState<MentorFilter>({});
    const [sort, setSort] = useState<MentorSort>({ field: 'createdAt', direction: 'desc' });
    const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
    const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
    const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
    const { confirm } = useConfirmDialog();
    const { showToast } = useToast();

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2">{params.row.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                        {params.row.title} at {params.row.company}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'skills',
            headerName: 'Skills',
            flex: 1,
            renderCell: (params) => (
                <Box display="flex" gap={0.5}>
                    {params.row.skills.slice(0, 3).map((skill) => (
                        <Chip
                            key={skill.id}
                            label={skill.name}
                            size="small"
                            variant="outlined"
                        />
                    ))}
                    {params.row.skills.length > 3 && (
                        <Chip
                            label={`+${params.row.skills.length - 3}`}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>
            ),
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 150,
            renderCell: (params) => (
                <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={params.row.averageRating} readOnly size="small" />
                    <Typography variant="caption">
                        ({params.row.totalSessions} sessions)
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.row.status}
                    color={
                        params.row.status === 'active' ? 'success' :
                        params.row.status === 'pending' ? 'warning' :
                        params.row.status === 'suspended' ? 'error' : 'default'
                    }
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton
                        size="small"
                        onClick={(e) => handleMentorAction(e, params.row)}
                    >
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    const handleMentorAction = (event: React.MouseEvent, mentor: MentorProfile) => {
        setSelectedMentor(mentor);
        setFilterMenuAnchor(event.currentTarget as HTMLElement);
    };

    const handleStatusChange = async (status: MentorStatus) => {
        if (!selectedMentor) return;
        
        try {
            await onStatusChange(selectedMentor.id, status);
            showToast('Mentor status updated successfully', 'success');
        } catch (error) {
            showToast('Failed to update mentor status', 'error');
        }
        setFilterMenuAnchor(null);
    };

    const handleDelete = async () => {
        if (!selectedMentor) return;

        const confirmed = await confirm({
            title: 'Delete Mentor',
            message: `Are you sure you want to delete ${selectedMentor.name}? This action cannot be undone.`,
            confirmLabel: 'Delete',
            severity: 'error',
        });

        if (confirmed) {
            try {
                await onDelete(selectedMentor.id);
                showToast('Mentor deleted successfully', 'success');
            } catch (error) {
                showToast('Failed to delete mentor', 'error');
            }
        }
        setFilterMenuAnchor(null);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Mentor Management</Typography>
                <Box display="flex" gap={1}>
                    <Button
                        startIcon={<FilterIcon />}
                        onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                    >
                        Filter
                    </Button>
                    <Button
                        startIcon={<SortIcon />}
                        onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                    >
                        Sort
                    </Button>
                </Box>
            </Box>

            <DataGrid
                rows={[]} // Connect to your data source
                columns={columns}
                autoHeight
                pagination
                disableSelectionOnClick
                sx={{ mt: 2 }}
            />

            <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={() => setFilterMenuAnchor(null)}
            >
                <MenuItem onClick={() => handleStatusChange('active')}>
                    <CheckIcon sx={{ mr: 1 }} /> Activate
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange('suspended')}>
                    <BlockIcon sx={{ mr: 1 }} /> Suspend
                </MenuItem>
                <MenuItem onClick={() => onEdit(selectedMentor!)}>
                    <EditIcon sx={{ mr: 1 }} /> Edit Profile
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>
        </Paper>
    );
};