export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
    status: MessageStatus;
    attachments?: {
        id: string;
        type: string;
        url: string;
        name: string;
    }[];
}

export interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
    lastSeen?: string;
}

export interface MessageParticipant {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen?: string;
    role: 'mentor' | 'mentee';
}

export interface SendMessageRequest {
    conversationId: string;
    content: string;
    attachments?: File[];
}

export interface MessageFilter {
    startDate?: string;
    endDate?: string;
    search?: string;
    status?: MessageStatus;
}