import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    IconButton,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Stepper,
    Step,
    StepLabel,
    Alert,
    Divider,
    useTheme
} from '@mui/material';
import {
    Merge as MergeIcon,
    Compare as CompareIcon,
    History as HistoryIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Conflict, Resolution, ConflictResolutionService } from '../../services/conflictResolution';
import { CollaborationUser } from '../../services/templateCollaboration';
import { DiffEditor } from '@monaco-editor/react';

interface ConflictResolutionDialogProps {
    open: boolean;
    onClose: () => void;
    conflict: Conflict;
    currentUser: CollaborationUser;
    onResolve: (resolution: Resolution) => void;
}

export const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
    open,
    onClose,
    conflict,
    currentUser,
    onResolve
}) => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [resolutionType, setResolutionType] = useState<Resolution['type']>('merge');
    const [description, setDescription] = useState('');
    const [mergeResult, setMergeResult] = useState('');
    const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (open) {
            setActiveStep(0);
            setResolutionType('merge');
            setDescription('');
            setMergeResult('');
            setSelectedResolution(null);
            setComment('');
        }
    }, [open]);

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleProposeResolution = async () => {
        if (!description) return;

        const resolution = await ConflictResolutionService.proposeResolution(
            conflict.section.id,
            conflict.id,
            {
                userId: currentUser.id,
                userName: currentUser.name,
                type: resolutionType,
                description,
                changes: []
            }
        );

        setSelectedResolution(resolution);
        handleNext();
    };

    const handleVote = async (vote: 'approve' | 'reject') => {
        if (!selectedResolution) return;

        await ConflictResolutionService.voteOnResolution(
            conflict.section.id,
            conflict.id,
            selectedResolution.id,
            currentUser.id,
            vote,
            comment
        );

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Resolve Conflict
                <Typography variant="subtitle2" color="text.secondary">
                    {conflict.type === 'concurrent-edit' && 'Concurrent edits detected'}
                    {conflict.type === 'lock-expired' && 'Lock expired'}
                    {conflict.type === 'version-mismatch' && 'Version mismatch'}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    <Step>
                        <StepLabel>Review Changes</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Propose Resolution</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Vote</StepLabel>
                    </Step>
                </Stepper>

                {activeStep === 0 && (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Conflicting Changes
                        </Typography>
                        <List>
                            {conflict.changes.map((change) => (
                                <ListItem key={change.id}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            {change.userName.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={change.userName}
                                        secondary={
                                            <>
                                                {formatDistanceToNow(
                                                    new Date(change.timestamp),
                                                    { addSuffix: true }
                                                )}
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {` • ${change.type} at ${change.path.join(' > ')}`}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        <FormControl component="fieldset" sx={{ mb: 3 }}>
                            <FormLabel component="legend">Resolution Type</FormLabel>
                            <RadioGroup
                                value={resolutionType}
                                onChange={(e) => setResolutionType(e.target.value as Resolution['type'])}
                            >
                                <FormControlLabel
                                    value="merge"
                                    control={<Radio />}
                                    label="Merge changes"
                                />
                                <FormControlLabel
                                    value="override"
                                    control={<Radio />}
                                    label="Override with latest"
                                />
                                <FormControlLabel
                                    value="revert"
                                    control={<Radio />}
                                    label="Revert to previous"
                                />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Explain your proposed resolution..."
                        />

                        {resolutionType === 'merge' && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Preview Merge Result
                                </Typography>
                                <DiffEditor
                                    height="200px"
                                    original={JSON.stringify(conflict.changes[0].value, null, 2)}
                                    modified={mergeResult}
                                    language="json"
                                    theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {activeStep === 2 && selectedResolution && (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Proposed Resolution
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                {selectedResolution.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <Chip
                                    size="small"
                                    label={selectedResolution.type}
                                    color="primary"
                                />
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Comment (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment to your vote..."
                        />

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Current Votes
                            </Typography>
                            <List>
                                {selectedResolution.votes.map((vote) => (
                                    <ListItem key={vote.userId}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">
                                                        {vote.userId === currentUser.id ? 'You' : 'User'}
                                                    </Typography>
                                                    {vote.vote === 'approve' ? (
                                                        <ThumbUpIcon color="success" fontSize="small" />
                                                    ) : (
                                                        <ThumbDownIcon color="error" fontSize="small" />
                                                    )}
                                                </Box>
                                            }
                                            secondary={vote.comment}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {activeStep > 0 && (
                    <Button onClick={handleBack}>
                        Back
                    </Button>
                )}
                {activeStep === 0 && (
                    <Button onClick={handleNext} variant="contained">
                        Next
                    </Button>
                )}
                {activeStep === 1 && (
                    <Button
                        onClick={handleProposeResolution}
                        variant="contained"
                        disabled={!description}
                    >
                        Propose Resolution
                    </Button>
                )}
                {activeStep === 2 && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            onClick={() => handleVote('reject')}
                            color="error"
                            startIcon={<ThumbDownIcon />}
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={() => handleVote('approve')}
                            color="success"
                            variant="contained"
                            startIcon={<ThumbUpIcon />}
                        >
                            Approve
                        </Button>
                    </Box>
                )}
            </DialogActions>
        </Dialog>
    );
};