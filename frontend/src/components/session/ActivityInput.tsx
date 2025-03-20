import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme
} from '@mui/material';
import {
    Code as CodeIcon,
    QuestionAnswer as QuestionIcon,
    Note as NoteIcon,
    Feedback as FeedbackIcon,
    Link as ResourceIcon,
    Add as AddIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { sessionActivityService, SessionActivity } from '../../services/sessionActivity';
import { CodeEditor } from './CodeEditor';

const PROGRAMMING_LANGUAGES = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'ruby', 'go', 'rust'
];

interface ActivityInputProps {
    sessionId: number;
    onActivityAdded?: () => void;
}

interface ActivityDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (activity: Omit<SessionActivity, 'timestamp' | 'userId'>) => void;
    type: SessionActivity['type'];
}

const CodeActivityDialog: React.FC<ActivityDialogProps> = ({ open, onClose, onSubmit, type }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [tags, setTags] = useState<string[]>([]);

    const handleSubmit = () => {
        onSubmit({
            type,
            content: code,
            metadata: {
                language,
                tags
            }
        });
        setCode('');
        setLanguage('javascript');
        setTags([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Add Code Snippet</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            label="Language"
                        >
                            {PROGRAMMING_LANGUAGES.map((lang) => (
                                <MenuItem key={lang} value={lang}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        language={language}
                    />
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={tags}
                        onChange={(_, newValue) => setTags(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    key={option}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tags"
                                placeholder="Add tags"
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!code}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const QuestionActivityDialog: React.FC<ActivityDialogProps> = ({ open, onClose, onSubmit, type }) => {
    const [question, setQuestion] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const handleSubmit = () => {
        onSubmit({
            type,
            content: question,
            metadata: {
                status: 'pending',
                tags
            }
        });
        setQuestion('');
        setTags([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Ask a Question</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="Question"
                        multiline
                        rows={4}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        fullWidth
                    />
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={tags}
                        onChange={(_, newValue) => setTags(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    key={option}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tags"
                                placeholder="Add tags"
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!question}>
                    Ask
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ResourceActivityDialog: React.FC<ActivityDialogProps> = ({ open, onClose, onSubmit, type }) => {
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const handleSubmit = () => {
        onSubmit({
            type,
            content: description,
            metadata: {
                url,
                tags
            }
        });
        setUrl('');
        setDescription('');
        setTags([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Share Resource</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                        label="URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Description"
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                    />
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={tags}
                        onChange={(_, newValue) => setTags(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    key={option}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tags"
                                placeholder="Add tags"
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={!url || !description}>
                    Share
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const ActivityInput: React.FC<ActivityInputProps> = ({ sessionId, onActivityAdded }) => {
    const theme = useTheme();
    const [activeDialog, setActiveDialog] = useState<SessionActivity['type'] | null>(null);
    const [note, setNote] = useState('');

    const handleAddActivity = (activity: Omit<SessionActivity, 'timestamp' | 'userId'>) => {
        sessionActivityService.addSessionActivity(sessionId, activity);
        onActivityAdded?.();
    };

    const actions = [
        { icon: <CodeIcon />, name: 'Code', type: 'code' as const },
        { icon: <QuestionIcon />, name: 'Question', type: 'question' as const },
        { icon: <ResourceIcon />, name: 'Resource', type: 'resource' as const }
    ];

    const handleNoteSubmit = () => {
        if (note.trim()) {
            handleAddActivity({
                type: 'note',
                content: note
            });
            setNote('');
        }
    };

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    position: 'relative',
                    backgroundColor: theme.palette.background.paper
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Add a note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleNoteSubmit();
                            }
                        }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleNoteSubmit}
                        disabled={!note.trim()}
                    >
                        <AddIcon />
                    </IconButton>
                </Box>

                <SpeedDial
                    ariaLabel="Add activity"
                    sx={{ position: 'absolute', bottom: 16, right: 16 }}
                    icon={<SpeedDialIcon />}
                    direction="left"
                >
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.type}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            onClick={() => setActiveDialog(action.type)}
                        />
                    ))}
                </SpeedDial>
            </Paper>

            <CodeActivityDialog
                open={activeDialog === 'code'}
                onClose={() => setActiveDialog(null)}
                onSubmit={handleAddActivity}
                type="code"
            />

            <QuestionActivityDialog
                open={activeDialog === 'question'}
                onClose={() => setActiveDialog(null)}
                onSubmit={handleAddActivity}
                type="question"
            />

            <ResourceActivityDialog
                open={activeDialog === 'resource'}
                onClose={() => setActiveDialog(null)}
                onSubmit={handleAddActivity}
                type="resource"
            />
        </>
    );
};