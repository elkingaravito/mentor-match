import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Tabs,
    Tab,
    IconButton,
    Badge,
    Tooltip,
    Divider,
    TextField,
    Button,
    Menu,
    MenuItem,
    useTheme
} from '@mui/material';
import {
    Comment as CommentIcon,
    History as HistoryIcon,
    Group as GroupIcon,
    Send as SendIcon,
    MoreVert as MoreVertIcon,
    Check as CheckIcon,
    EmojiEmotions as EmojiIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import {
    CollaborationUser,
    Comment,
    Change,
    TemplateCollaborationService
} from '../../services/templateCollaboration';

interface CollaborationPanelProps {
    templateId: string;
    currentUser: CollaborationUser;
    open: boolean;
    onClose: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <Box
        role="tabpanel"
        hidden={value !== index}
        sx={{ height: '100%', overflow: 'auto' }}
    >
        {value === index && children}
    </Box>
);

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
    templateId,
    currentUser,
    open,
    onClose
}) => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [users, setUsers] = useState<CollaborationUser[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [changes, setChanges] = useState<Change[]>([]);
    const [newComment, setNewComment] = useState('');
    const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null);
    const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

    useEffect(() => {
        const session = TemplateCollaborationService.joinSession(templateId, currentUser);
        
        const unsubscribePresence = TemplateCollaborationService.onPresenceChange(
            templateId,
            setUsers
        );

        const unsubscribeComments = TemplateCollaborationService.onCommentAdded(
            templateId,
            (comment) => setComments(prev => [...prev, comment])
        );

        const unsubscribeChanges = TemplateCollaborationService.onChangeRecorded(
            templateId,
            (change) => setChanges(prev => [...prev, change])
        );

        return () => {
            TemplateCollaborationService.leaveSession(templateId, currentUser.id);
            unsubscribePresence();
            unsubscribeComments();
            unsubscribeChanges();
        };
    }, [templateId, currentUser]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        await TemplateCollaborationService.addComment(templateId, {
            userId: currentUser.id,
            userName: currentUser.name,
            content: newComment
        });

        setNewComment('');
    };

    const handleResolveComment = async (commentId: string) => {
        await TemplateCollaborationService.resolveComment(templateId, commentId);
    };

    const handleAddReaction = async (commentId: string, emoji: string) => {
        await TemplateCollaborationService.addReaction(
            templateId,
            commentId,
            currentUser.id,
            emoji
        );
        setEmojiAnchor(null);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            variant="persistent"
            sx={{
                width: 320,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 320,
                    boxSizing: 'border-box'
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    variant="fullWidth"
                >
                    <Tab
                        icon={
                            <Badge badgeContent={users.length} color="primary">
                                <GroupIcon />
                            </Badge>
                        }
                        label="Users"
                    />
                    <Tab
                        icon={
                            <Badge badgeContent={comments.length} color="primary">
                                <CommentIcon />
                            </Badge>
                        }
                        label="Comments"
                    />
                    <Tab
                        icon={
                            <Badge badgeContent={changes.length} color="primary">
                                <HistoryIcon />
                            </Badge>
                        }
                        label="History"
                    />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <List>
                        {users.map((user) => (
                            <ListItem key={user.id}>
                                <ListItemAvatar>
                                    <Avatar src={user.avatar}>
                                        {user.name.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.name}
                                    secondary={
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDistanceToNow(new Date(user.lastActivity), { addSuffix: true })}
                                        </Typography>
                                    }
                                />
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: user.status === 'active' ? 'success.main' : 'text.disabled'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <List sx={{ flex: 1, overflow: 'auto' }}>
                            {comments.map((comment) => (
                                <ListItem
                                    key={comment.id}
                                    sx={{
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        opacity: comment.resolved ? 0.6 : 1
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <ListItemAvatar>
                                            <Avatar>{comment.userName.charAt(0)}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={comment.userName}
                                            secondary={formatDistanceToNow(
                                                new Date(comment.timestamp),
                                                { addSuffix: true }
                                            )}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                setSelectedComment(comment);
                                                setEmojiAnchor(e.currentTarget);
                                            }}
                                        >
                                            <EmojiIcon />
                                        </IconButton>
                                        {!comment.resolved && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleResolveComment(comment.id)}
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                    <Box sx={{ pl: 7, pr: 2, width: '100%' }}>
                                        <Typography variant="body2">
                                            {comment.content}
                                        </Typography>
                                        {comment.reactions && Object.entries(comment.reactions).length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                                {Object.entries(comment.reactions).map(([emoji, users]) => (
                                                    <Chip
                                                        key={emoji}
                                                        label={`${emoji} ${users.length}`}
                                                        size="small"
                                                        onClick={() => handleAddReaction(comment.id, emoji)}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                        <Divider />
                        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <List>
                        {changes.map((change) => (
                            <ListItem
                                key={change.id}
                                sx={{
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <ListItemAvatar>
                                        <Avatar>{change.userName.charAt(0)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={change.userName}
                                        secondary={formatDistanceToNow(
                                            new Date(change.timestamp),
                                            { addSuffix: true }
                                        )}
                                    />
                                </Box>
                                <Box sx={{ pl: 7, pr: 2 }}>
                                    <Typography variant="body2">
                                        {change.type === 'add' && 'Added'}
                                        {change.type === 'update' && 'Updated'}
                                        {change.type === 'delete' && 'Deleted'}
                                        {' '}
                                        {change.path.join(' > ')}
                                    </Typography>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </TabPanel>
            </Box>

            <Menu
                anchorEl={emojiAnchor}
                open={Boolean(emojiAnchor)}
                onClose={() => setEmojiAnchor(null)}
            >
                <EmojiPicker
                    onEmojiClick={(emoji) => {
                        if (selectedComment) {
                            handleAddReaction(selectedComment.id, emoji.emoji);
                        }
                    }}
                />
            </Menu>
        </Drawer>
    );
};