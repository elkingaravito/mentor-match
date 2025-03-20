import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Chip,
    TextField,
    InputAdornment,
    Divider,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FileCopy as CloneIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { ExportTemplate } from '../../services/templateService';

interface TemplateSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelect: (template: ExportTemplate) => void;
    templates: ExportTemplate[];
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    open,
    onClose,
    onSelect,
    templates
}) => {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.description.toLowerCase().includes(search.toLowerCase()) ||
        template.metadata?.tags?.some(tag => 
            tag.toLowerCase().includes(search.toLowerCase())
        )
    );

    const handleSelect = (template: ExportTemplate) => {
        setSelectedTemplate(template);
    };

    const handleConfirm = () => {
        if (selectedTemplate) {
            onSelect(selectedTemplate);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Select Export Template</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />

                    <List>
                        {filteredTemplates.map((template) => (
                            <React.Fragment key={template.id}>
                                <ListItem
                                    button
                                    selected={selectedTemplate?.id === template.id}
                                    onClick={() => handleSelect(template)}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1">
                                                {template.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {template.description}
                                                </Typography>
                                                <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                                                    <Chip
                                                        size="small"
                                                        label={template.format.toUpperCase()}
                                                        color="primary"
                                                    />
                                                    {template.metadata?.tags?.map((tag) => (
                                                        <Chip
                                                            key={tag}
                                                            size="small"
                                                            label={tag}
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            size="small"
                                            onClick={() => {/* Handle edit */}}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {/* Handle clone */}}
                                        >
                                            <CloneIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {/* Handle delete */}}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>

                    {filteredTemplates.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography color="text.secondary">
                                No templates found
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    startIcon={<AddIcon />}
                    onClick={() => {/* Handle create new */}}
                >
                    Create New
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!selectedTemplate}
                >
                    Use Template
                </Button>
            </DialogActions>
        </Dialog>
    );
};