import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondary,
    Switch,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { api } from '../../services/api';

interface ScheduledExport {
    id: number;
    name: string;
    description: string;
    frequency: string;
    format: string;
    filters: any;
    recipients: string[];
    last_run: string;
    next_run: string;
    is_active: boolean;
}

export const ScheduledExportsManager: React.FC = () => {
    const [exports, setExports] = useState<ScheduledExport[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingExport, setEditingExport] = useState<ScheduledExport | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        frequency: 'weekly',
        format: 'pdf',
        recipients: [''],
        is_active: true
    });

    useEffect(() => {
        fetchScheduledExports();
    }, []);

    const fetchScheduledExports = async () => {
        try {
            const response = await api.get('/scheduled-exports');
            setExports(response.data);
        } catch (error) {
            console.error('Failed to fetch scheduled exports:', error);
        }
    };

    const handleDialogOpen = (exportItem?: ScheduledExport) => {
        if (exportItem) {
            setEditingExport(exportItem);
            setFormData({
                name: exportItem.name,
                description: exportItem.description,
                frequency: exportItem.frequency,
                format: exportItem.format,
                recipients: exportItem.recipients,
                is_active: exportItem.is_active
            });
        } else {
            setEditingExport(null);
            setFormData({
                name: '',
                description: '',
                frequency: 'weekly',
                format: 'pdf',
                recipients: [''],
                is_active: true
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingExport) {
                await api.put(`/scheduled-exports/${editingExport.id}`, formData);
            } else {
                await api.post('/scheduled-exports', formData);
            }
            setDialogOpen(false);
            fetchScheduledExports();
        } catch (error) {
            console.error('Failed to save scheduled export:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this scheduled export?')) {
            try {
                await api.delete(`/scheduled-exports/${id}`);
                fetchScheduledExports();
            } catch (error) {
                console.error('Failed to delete scheduled export:', error);
            }
        }
    };

    const handleToggleActive = async (export_: ScheduledExport) => {
        try {
            await api.put(`/scheduled-exports/${export_.id}`, {
                is_active: !export_.is_active
            });
            fetchScheduledExports();
        } catch (error) {
            console.error('Failed to toggle export status:', error);
        }
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center" marginBottom={2}>
                        <Typography variant="h6">Scheduled Exports</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleDialogOpen()}
                        >
                            New Schedule
                        </Button>
                    </Grid>

                    <List>
                        {exports.map((export_) => (
                            <ListItem
                                key={export_.id}
                                secondaryAction={
                                    <>
                                        <Switch
                                            edge="end"
                                            checked={export_.is_active}
                                            onChange={() => handleToggleActive(export_)}
                                        />
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDialogOpen(export_)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDelete(export_.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={export_.name}
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2">
                                                {export_.description}
                                            </Typography>
                                            <br />
                                            <Chip
                                                size="small"
                                                label={export_.frequency}
                                                color="primary"
                                            />
                                            <Chip
                                                size="small"
                                                label={export_.format}
                                                color="secondary"
                                                sx={{ ml: 1 }}
                                            />
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingExport ? 'Edit Scheduled Export' : 'New Scheduled Export'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                    label="Frequency"
                                >
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                    <MenuItem value="quarterly">Quarterly</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Format</InputLabel>
                                <Select
                                    value={formData.format}
                                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                    label="Format"
                                >
                                    <MenuItem value="csv">CSV</MenuItem>
                                    <MenuItem value="excel">Excel</MenuItem>
                                    <MenuItem value="pdf">PDF Report</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Recipients (comma-separated emails)"
                                value={formData.recipients.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    recipients: e.target.value.split(',').map(email => email.trim())
                                })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingExport ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};