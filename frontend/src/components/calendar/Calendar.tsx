interface SessionEventProps {
    event: Session;
    userRole: 'admin' | 'mentor' | 'mentee';
    onStatusChange?: (sessionId: number, status: SessionStatus) => Promise<void>;
    onReassign?: (sessionId: number, newMentorId: number) => Promise<void>;
}

const SessionEvent: React.FC<SessionEventProps> = ({
    event,
    userRole,
    onStatusChange,
    onReassign
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isReassignDialogOpen, setReassignDialogOpen] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleStatusChange = async (status: SessionStatus) => {
        if (onStatusChange) {
            await onStatusChange(event.sessionId, status);
        }
        handleClose();
    };

    const handleReassign = async (newMentorId: number) => {
        if (onReassign) {
            await onReassign(event.sessionId, newMentorId);
        }
        setReassignDialogOpen(false);
    };

    if (userRole !== 'admin') {
        return <div>{event.title}</div>;
    }

    return (
        <Box>
            <Typography variant="body2">{event.title}</Typography>
            <Box sx={{ mt: 1 }}>
                <Button
                    size="small"
                    onClick={handleClick}
                >
                    Manage
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={() => handleStatusChange('confirmed')}>
                        Confirm Session
                    </MenuItem>
                    <MenuItem onClick={() => handleStatusChange('cancelled')}>
                        Cancel Session
                    </MenuItem>
                    <MenuItem onClick={() => setReassignDialogOpen(true)}>
                        Reassign Mentor
                    </MenuItem>
                </Menu>
            </Box>
            <ReassignDialog
                open={isReassignDialogOpen}
                onClose={() => setReassignDialogOpen(false)}
                onReassign={handleReassign}
                currentMentorId={event.mentorId}
            />
        </Box>
    );
};