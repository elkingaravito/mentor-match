import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Paper,
    Chip,
    Skeleton,
    useTheme
} from '@mui/material';
import {
    Code as CodeIcon,
    QuestionAnswer as QuestionIcon,
    Note as NoteIcon,
    Feedback as FeedbackIcon,
    Link as ResourceIcon
} from '@mui/icons-material';
import { useGetSessionActivitiesQuery } from '../../services/sessionActivity';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItemProps {
    activity: SessionActivity;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
    const theme = useTheme();

    const getIcon = () => {
        const icons = {
            code: <CodeIcon />,
            question: <QuestionIcon />,
            note: <NoteIcon />,
            feedback: <FeedbackIcon />,
            resource: <ResourceIcon />
        };
        return icons[activity.type];
    };

    const getStatusColor = () => {
        if (!activity.metadata?.status) return undefined;
        return activity.metadata.status === 'resolved' ? 'success' : 'warning';
    };

    return (
        <ListItem
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderLeft: 2,
                borderColor: theme.palette.primary.main,
                my: 1,
                py: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                    {getIcon()}
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Typography variant="subtitle2">
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                            {activity.metadata?.status && (
                                <Chip
                                    size="small"
                                    label={activity.metadata.status}
                                    color={getStatusColor()}
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </Typography>
                    }
                    secondary={formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                />
            </Box>
            <Box sx={{ pl: 5, width: '100%' }}>
                {activity.type === 'code' ? (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            backgroundColor: theme.palette.grey[900],
                            fontFamily: 'monospace'
                        }}
                    >
                        <pre style={{ margin: 0, overflow: 'auto' }}>
                            {activity.content}
                        </pre>
                    </Paper>
                ) : (
                    <Typography variant="body2">
                        {activity.content}
                    </Typography>
                )}
                {activity.metadata?.tags && (
                    <Box sx={{ mt: 1 }}>
                        {activity.metadata.tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{ mr: 0.5 }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </ListItem>
    );
};

interface ActivityFeedProps {
    sessionId: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ sessionId }) => {
    const {
        data: activities,
        isLoading
    } = useGetSessionActivitiesQuery(sessionId);

    if (isLoading) {
        return (
            <List>
                {Array(3).fill(0).map((_, index) => (
                    <ListItem key={index}>
                        <ListItemIcon>
                            <Skeleton variant="circular" width={24} height={24} />
                        </ListItemIcon>
                        <ListItemText
                            primary={<Skeleton variant="text" width="60%" />}
                            secondary={<Skeleton variant="text" width="40%" />}
                        />
                    </ListItem>
                ))}
            </List>
        );
    }

    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [groupBy, setGroupBy] = useState<GroupBy>('none');

    const {
        filters,
        setFilters,
        filteredActivities,
        availableTags
    } = useActivityFilters(activities);

    const organizedActivities = useMemo(() => {
        const sorted = ActivityOrganizer.sortActivities(
            filteredActivities,
            sortField,
            sortOrder
        );
        return ActivityOrganizer.groupActivities(sorted, groupBy);
    }, [filteredActivities, sortField, sortOrder, groupBy]);

    const handleSortChange = (field: SortField, order: SortOrder) => {
        setSortField(field);
        setSortOrder(order);
    };

    return (
        <Box>
            <ActivityFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableTags={availableTags}
            />
            <ActivityOrganizer
                sortField={sortField}
                sortOrder={sortOrder}
                groupBy={groupBy}
                onSortChange={handleSortChange}
                onGroupChange={setGroupBy}
            />
            {organizedActivities.map(group => (
                <Box key={group.key} sx={{ mb: 3 }}>
                    {groupBy !== 'none' && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                px: 2,
                                py: 1,
                                backgroundColor: 'background.default'
                            }}
                        >
                            <Typography variant="subtitle2">
                                {group.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {group.metadata?.count} activities
                                {group.metadata?.resolvedCount !== undefined && (
                                    ` • ${group.metadata.resolvedCount} resolved`
                                )}
                            </Typography>
                        </Box>
                    )}
                    <List>
                        {group.activities.map((activity) => (
                            <ActivityItem key={activity.timestamp} activity={activity} />
                        ))}
                    </List>
                </Box>
            ))}
            {filteredActivities.length === 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        py: 4
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        No activities match your filters
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => setFilters({
                            search: '',
                            types: [],
                            status: null,
                            tags: [],
                            dateRange: null
                        })}
                    >
                        Clear all filters
                    </Button>
                </Box>
            )}
        </Box>
    );
};
