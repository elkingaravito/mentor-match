import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetConversationsQuery } from '../../services/api';
import { format } from 'date-fns';
import EmptyState from '../../components/feedback/EmptyState';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

const MessageList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: conversations, isLoading } = useGetConversationsQuery();

  const filteredConversations = React.useMemo(() => {
    if (!conversations?.data) return [];
    return conversations.data.filter(conv =>
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!conversations?.data?.length) {
    return (
      <EmptyState
        icon={SearchIcon}
        title="No Messages"
        description="You don't have any messages yet. Start a conversation with a mentor!"
        actionLabel="Find Mentors"
        onAction={() => navigate('/mentors')}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Divider />

        <List sx={{ p: 0 }}>
          {filteredConversations.map((conversation, index) => (
            <React.Fragment key={conversation.id}>
              <ListItem
                button
                onClick={() => navigate(`/messages/${conversation.id}`)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar src={conversation.participantAvatar}>
                      {conversation.participantName[0]}
                    </Avatar>
                    {conversation.isOnline && (
                      <CircleIcon
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          color: 'success.main',
                          fontSize: 12,
                        }}
                      />
                    )}
                  </Box>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        {conversation.participantName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(conversation.lastMessageTime), 'PP')}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        pr: 2,
                      }}
                    >
                      {conversation.lastMessage}
                    </Typography>
                  }
                />
                {conversation.unreadCount > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ml: 1,
                    }}
                  >
                    <Typography variant="caption">
                      {conversation.unreadCount}
                    </Typography>
                  </Box>
                )}
              </ListItem>
              {index < filteredConversations.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default MessageList;