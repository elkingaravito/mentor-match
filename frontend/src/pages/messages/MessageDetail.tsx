import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useGetMessagesQuery, useSendMessageMutation } from '../../services/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const MessageDetail: React.FC = () => {
  const { id } = useParams();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = React.useState('');
  
  const { data: messages, isLoading } = useGetMessagesQuery(id!);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        conversationId: id!,
        content: newMessage,
      }).unwrap();
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={messages?.participant?.avatar}>
              {messages?.participant?.name[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {messages?.participant?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {messages?.participant?.isOnline ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <AnimatePresence>
            {messages?.data.map((message: Message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.senderId === 'currentUser' ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      bgcolor: message.senderId === 'currentUser' ? 'primary.main' : 'grey.100',
                      color: message.senderId === 'currentUser' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Typography variant="body1">
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        color: message.senderId === 'currentUser' ? 'primary.light' : 'text.secondary',
                      }}
                    >
                      {format(new Date(message.timestamp), 'p')}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton>
              <AttachFileIcon />
            </IconButton>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageDetail;