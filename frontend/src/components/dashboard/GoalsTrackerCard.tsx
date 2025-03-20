import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    Skeleton,
    Alert,
    IconButton,
    CircularProgress,
    Tooltip,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    useTheme
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Add as AddIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useGetUserGoalsQuery, useUpdateGoalMutation } from '../../services/api';

interface GoalProgressProps {
    completed: number;
    total: number;
    label: string;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ completed, total, label }) => {
    const theme = useTheme();
    const progress = (completed / total) * 100;

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={80}
                    sx={{ color: theme.palette.grey[200] }}
                />
                <CircularProgress
                    variant="determinate"
                    value={progress}
                    size={80}
                    sx={{
                        position: 'absolute',
                        left: 0,
                        color: theme.palette.primary.main,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="body2" component="div" color="text.secondary">
                        {`${Math.round(progress)}%`}
                    </Typography>
                </Box>
            </Box>
            <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {`${completed}/${total}`}
            </Typography>
        </Box>
    );
};

interface Goal {
    id: number;
    title: string;
    target: number;
    completed: number;
    deadline: string;
    category: string;
    status: 'in_progress' | 'completed' | 'overdue';
}

interface GoalItemProps {
    goal: Goal;
    onEdit: (goal: Goal) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, onEdit }) => {
    const theme = useTheme();
    const progress = (goal.completed / goal.target) * 100;

    const getStatusColor = (status: Goal['status']) => {
        const colors = {
            in_progress: theme.palette.info.main,
            completed: theme.palette.success.main,
            overdue: theme.palette.error.main
        };
        return colors[status];
    };

    const getStatusIcon = (status: Goal['status']) => {
        const icons = {
            in_progress: <ScheduleIcon fontSize="small" />,
            completed: <CheckCircleIcon fontSize="small" />,
            overdue: <TrendingUpIcon fontSize="small" />
        };
        return icons[status];
    };

    return (
        <Box sx={{ 
            p: 2, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1,
            mb: 2,
            '&:last-child': { mb: 0 }
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                    <Typography variant="subtitle1">{goal.title}</Typography>
                    <Chip
                        icon={getStatusIcon(goal.status)}
                        label={goal.status.replace('_', ' ')}
                        size="small"
                        sx={{ 
                            backgroundColor: getStatusColor(goal.status),
                            color: 'white',
                            mt: 0.5
                        }}
                    />
                </Box>
                <IconButton size="small" onClick={() => onEdit(goal)}>
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Box sx={{ flex: 1, mr: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {`${goal.completed}/${goal.target}`}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 1 }}
                    />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Due {new Date(goal.deadline).toLocaleDateString()}
                </Typography>
            </Box>
        </Box>
    );
};

interface GoalDialogProps {
    open: boolean;
    onClose: () => void;
    goal?: Goal;
    onSave: (goal: Partial<Goal>) => void;
}

const GoalDialog: React.FC<GoalDialogProps> = ({ open, onClose, goal, onSave }) => {
    const [formData, setFormData] = React.useState({
        title: '',
        target: 0,
        deadline: '',
        category: ''
    });

    React.useEffect(() => {
        if (goal) {
            setFormData({
                title: goal.title,
                target: goal.target,
                deadline: goal.deadline,
                category: goal.category
            });
        }
    }, [goal]);

    const handleSubmit = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{goal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        label="Target"
                        type="number"
                        value={formData.target}
                        onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) })}
                        fullWidth
                    />
                    <TextField
                        label="Deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export const GoalsTrackerCard: React.FC = () => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedGoal, setSelectedGoal] = React.useState<Goal | undefined>();
    
    const {
        data: response,
        isLoading,
        isError,
        error,
        refetch
    } = useGetUserGoalsQuery();

    const [updateGoal] = useUpdateGoalMutation();

    const goals = response?.data;

    const handleEditGoal = (goal: Goal) => {
        setSelectedGoal(goal);
        setDialogOpen(true);
    };

    const handleSaveGoal = async (goalData: Partial<Goal>) => {
        try {
            if (selectedGoal) {
                await updateGoal({ id: selectedGoal.id, ...goalData }).unwrap();
            }
            refetch();
        } catch (err) {
            console.error('Failed to update goal:', err);
        }
    };

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <Alert
                        severity="error"
                        action={
                            <IconButton
                                color="inherit"
                                size="small"
                                onClick={() => refetch()}
                            >
                                <RefreshIcon />
                            </IconButton>
                        }
                    >
                        {error instanceof Error ? error.message : 'Failed to load goals'}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader
                title="Goals Tracker"
                action={
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedGoal(undefined);
                            setDialogOpen(true);
                        }}
                    >
                        Add Goal
                    </Button>
                }
            />
            <CardContent>
                {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
                        </Box>
                    ))
                ) : goals ? (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
                            <GoalProgress
                                completed={goals.filter(g => g.status === 'completed').length}
                                total={goals.length}
                                label="Completed Goals"
                            />
                            <GoalProgress
                                completed={goals.reduce((acc, g) => acc + g.completed, 0)}
                                total={goals.reduce((acc, g) => acc + g.target, 0)}
                                label="Overall Progress"
                            />
                        </Box>
                        {goals.map((goal) => (
                            <GoalItem
                                key={goal.id}
                                goal={goal}
                                onEdit={handleEditGoal}
                            />
                        ))}
                    </>
                ) : null}
            </CardContent>
            <GoalDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                goal={selectedGoal}
                onSave={handleSaveGoal}
            />
        </Card>
    );
};