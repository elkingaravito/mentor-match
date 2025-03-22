import React, { useState, useMemo } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Calendar } from './Calendar';
import { Session, SessionStatus, AdminCalendarProps } from '../../types/calendar';
import { useCalendar } from '../../hooks/useCalendar';

const getSessionStatusColor = (status: SessionStatus): string => {
    switch (status) {
        case 'pending': return '#ffd700';
        case 'confirmed': return '#4caf50';
        case 'cancelled': return '#f44336';
        case 'completed': return '#2196f3';
        default: return '#757575';
    }
};

const SessionEvent: React.FC<{
    event: Session;
    onStatusChange: (sessionId: number, status: SessionStatus) => Promise<void>;
    onReassign: (sessionId: number, newMentorId: number) => Promise<void>;
}> = ({ event, onStatusChange, onReassign }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isReassignDialogOpen, setReassignDialogOpen] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    return (
        <Box id={`session-${event.sessionId}`}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <span>{event.title}</span>
                <Button size="small" onClick={handleClick}>
                    Manage
                </Button>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => {
                    onStatusChange(event.sessionId, 'confirmed');
                    setAnchorEl(null);
                }}>
                    Confirm Session
                </MenuItem>
                <MenuItem onClick={() => {
                    onStatusChange(event.sessionId, 'cancelled');
                    setAnchorEl(null);
                }}>
                    Cancel Session
                </MenuItem>
                <MenuItem onClick={() => {
                    setReassignDialogOpen(true);
                    setAnchorEl(null);
                }}>
                    Reassign Mentor
                </MenuItem>
            </Menu>
            <ReassignDialog
                open={isReassignDialogOpen}
                onClose={() => setReassignDialogOpen(false)}
                sessionId={event.sessionId}
                currentMentorId={event.mentorId}
                onReassign={onReassign}
            />
        </Box>
    );
};

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
    onSessionUpdate,
    onSessionReassign,
}) => {
    const { sessions, mentors } = useCalendar();

    const calendarEvents = useMemo(() => 
        sessions.map(session => ({
            ...session,
            title: `${session.mentorName} - ${session.menteeName}`,
            start: new Date(session.startTime),
            end: new Date(session.endTime),
        })), [sessions]);

    return (
        <Calendar
            events={calendarEvents}
            eventPropGetter={(event: Session) => ({
                style: {
                    backgroundColor: getSessionStatusColor(event.status),
                }
            })}
            components={{
                event: (props) => (
                    <SessionEvent
                        event={props.event}
                        onStatusChange={onSessionUpdate}
                        onReassign={onSessionReassign}
                    />
                )
            }}
        />
    );
};