import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Grid,
    FormControlLabel,
    Switch,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    DragHandle as DragHandleIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Column {
    id: string;
    name: string;
    visible: boolean;
    width?: number;
    alignment?: 'left' | 'center' | 'right';
}

interface ColumnManagerProps {
    availableColumns: Column[];
    selectedColumns: Column[];
    onColumnsChange: (columns: Column[]) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
    availableColumns,
    selectedColumns,
    onColumnsChange
}) => {
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [selectedColumnForConfig, setSelectedColumnForConfig] = useState<Column | null>(null);

    const handleConfigureColumn = (column: Column) => {
        setSelectedColumnForConfig(column);
        setConfigDialogOpen(true);
    };

    const handleConfigSave = (columnId: string, config: ColumnConfig) => {
        const updatedColumns = selectedColumns.map(col =>
            col.id === columnId ? { ...col, config } : col
        );
        onColumnsChange(updatedColumns);
    };
    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(selectedColumns);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onColumnsChange(items);
    };

    const toggleColumnVisibility = (columnId: string) => {
        const updatedColumns = selectedColumns.map(col => 
            col.id === columnId ? { ...col, visible: !col.visible } : col
        );
        onColumnsChange(updatedColumns);
    };

    const addColumn = (column: Column) => {
        if (!selectedColumns.find(col => col.id === column.id)) {
            onColumnsChange([...selectedColumns, { ...column, visible: true }]);
        }
    };

    const removeColumn = (columnId: string) => {
        onColumnsChange(selectedColumns.filter(col => col.id !== columnId));
    };

    const moveColumn = (columnId: string, direction: 'up' | 'down') => {
        const index = selectedColumns.findIndex(col => col.id === columnId);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === selectedColumns.length - 1)
        ) {
            return;
        }

        const newColumns = [...selectedColumns];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
        onColumnsChange(newColumns);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Available Columns
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {availableColumns
                            .filter(col => !selectedColumns.find(selected => selected.id === col.id))
                            .map(column => (
                                <Chip
                                    key={column.id}
                                    label={column.name}
                                    onClick={() => addColumn(column)}
                                    sx={{ m: 0.5 }}
                                />
                            ))}
                    </Box>
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Selected Columns
                    </Typography>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="columns">
                            {(provided) => (
                                <List
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    dense
                                >
                                    {selectedColumns.map((column, index) => (
                                        <Draggable
                                            key={column.id}
                                            draggableId={column.id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <ListItem
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    secondaryAction={
                                                        <Box>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => moveColumn(column.id, 'up')}
                                                                disabled={index === 0}
                                                            >
                                                                <ArrowUpwardIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => moveColumn(column.id, 'down')}
                                                                disabled={index === selectedColumns.length - 1}
                                                            >
                                                                <ArrowDownwardIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => toggleColumnVisibility(column.id)}
                                                            >
                                                                {column.visible ? (
                                                                    <VisibilityIcon />
                                                                ) : (
                                                                    <VisibilityOffIcon />
                                                                )}
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeColumn(column.id)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                    }
                                                >
                                                    <ListItemIcon {...provided.dragHandleProps}>
                                                        <DragHandleIcon />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={column.name}
                                                        secondary={
                                                            <Typography variant="caption" color="textSecondary">
                                                                {column.config?.width}px • {column.config?.alignment}
                                                                {column.config?.numberFormat && ' • Number'}
                                                                {column.config?.dateFormat && ' • Date'}
                                                            </Typography>
                                                        }
                                                        sx={{
                                                            opacity: column.visible ? 1 : 0.5
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleConfigureColumn(column)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <SettingsIcon />
                                                    </IconButton>
                                                </ListItem>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </List>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Paper>
            </Grid>

            {selectedColumnForConfig && (
                <ColumnConfigDialog
                    open={configDialogOpen}
                    onClose={() => {
                        setConfigDialogOpen(false);
                        setSelectedColumnForConfig(null);
                    }}
                    column={selectedColumnForConfig}
                    onSave={handleConfigSave}
                />
            )}
        </Grid>
    );
};
