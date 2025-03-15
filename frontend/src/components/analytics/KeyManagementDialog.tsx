import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondary,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Alert,
    Chip,
    Stack
} from '@mui/material';
import {
    Key as KeyIcon,
    Delete as DeleteIcon,
    Restore as RecoverIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { KeyManagementService } from '../../services/KeyManagementService';

interface KeyManagementDialogProps {
    open: boolean;
    onClose: () => void;
    onKeySelect: (keyId: string) => void;
}

export const KeyManagementDialog: React.FC<KeyManagementDialogProps> = ({
    open,
    onClose,
    onKeySelect
}) => {
    const [keys, setKeys] = useState<KeyMetadata[]>([]);
    const [showAddKey, setShowAddKey] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyPassword, setNewKeyPassword] = useState('');
    const [recoveryQuestion, setRecoveryQuestion] = useState('');
    const [recoveryAnswer, setRecoveryAnswer] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadKeys();
        }
    }, [open]);

    const loadKeys = () => {
        const storedKeys = KeyManagementService.getKeyMetadata();
        setKeys(storedKeys);
    };

    const handleAddKey = async () => {
        try {
            setError(null);
            const keyId = await KeyManagementService.storeKey(
                newKeyName,
                newKeyPassword,
                recoveryAnswer
            );
            loadKeys();
            setShowAddKey(false);
            clearForm();
        } catch (error) {
            setError('Failed to add key');
            console.error('Add key error:', error);
        }
    };

    const handleRecoverKey = async () => {
        if (!selectedKeyId || !recoveryAnswer) return;

        try {
            setError(null);
            const recoveredPassword = await KeyManagementService.recoverKey(
                selectedKeyId,
                recoveryAnswer
            );

            if (recoveredPassword) {
                onKeySelect(selectedKeyId);
                onClose();
            } else {
                setError('Recovery failed: Incorrect answer');
            }
        } catch (error) {
            setError('Recovery failed');
            console.error('Recovery error:', error);
        }
    };

    const clearForm = () => {
        setNewKeyName('');
        setNewKeyPassword('');
        setRecoveryQuestion('');
        setRecoveryAnswer('');
        setError(null);
    };

    const [backupDialogOpen, setBackupDialogOpen] = useState(false);
    const [backupMode, setBackupMode] = useState<'backup' | 'restore'>('backup');

    const handleOpenBackup = (mode: 'backup' | 'restore') => {
        setBackupMode(mode);
        setBackupDialogOpen(true);
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Encryption Key Management</Typography>
                        <Box>
                            <IconButton
                                onClick={() => handleOpenBackup('backup')}
                                title="Backup Keys"
                            >
                                <BackupIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => handleOpenBackup('restore')}
                                title="Restore Keys"
                            >
                                <RestoreIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!showAddKey && !showRecovery && (
                    <>
                        <Box display="flex" justifyContent="flex-end" mb={2}>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => setShowAddKey(true)}
                            >
                                Add New Key
                            </Button>
                        </Box>

                        <List>
                            {keys.map((key) => (
                                <ListItem
                                    key={key.id}
                                    secondaryAction={
                                        <Stack direction="row" spacing={1}>
                                            {key.hasRecoveryHint && (
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedKeyId(key.id);
                                                        setShowRecovery(true);
                                                    }}
                                                >
                                                    <RecoverIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                onClick={() => onKeySelect(key.id)}
                                            >
                                                <KeyIcon />
                                            </IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemText
                                        primary={key.name}
                                        secondary={
                                            <>
                                                Created: {new Date(key.createdAt).toLocaleDateString()}
                                                <br />
                                                Last used: {new Date(key.lastUsed).toLocaleDateString()}
                                                <>
                                                    <KeyManagementDialog
                                                        open={keyManagementOpen}
                                                        onClose={() => setKeyManagementOpen(false)}
                                                        onKeySelect={async (keyId) => {
                                                            const key = await KeyManagementService.getKey(keyId);
                                                            if (key) {
                                                                setSelectedKeyId(keyId);
                                                                setPassword(key);
                                                                setConfirmPassword(key);
                                                            }
                                                            setKeyManagementOpen(false);
                                                        }}
                                                    />
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}

                {showAddKey && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Add New Encryption Key
                        </Typography>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="Key Name"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                value={newKeyPassword}
                                onChange={(e) => setNewKeyPassword(e.target.value)}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Recovery Question</InputLabel>
                                <Select
                                    value={recoveryQuestion}
                                    onChange={(e) => setRecoveryQuestion(e.target.value)}
                                    label="Recovery Question"
                                >
                                    {KeyManagementService.getRecoveryQuestions().map((q) => (
                                        <MenuItem key={q} value={q}>
                                            {q}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Recovery Answer"
                                value={recoveryAnswer}
                                onChange={(e) => setRecoveryAnswer(e.target.value)}
                            />
                        </Stack>
                    </Box>
                )}

                {showRecovery && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Recover Key
                        </Typography>
                        <TextField
                            fullWidth
                            label="Recovery Answer"
                            value={recoveryAnswer}
                            onChange={(e) => setRecoveryAnswer(e.target.value)}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {showAddKey && (
                    <Button
                        onClick={handleAddKey}
                        variant="contained"
                        disabled={!newKeyName || !newKeyPassword}
                    >
                        Add Key
                    </Button>
                )}
                {showRecovery && (
                    <Button
                        onClick={handleRecoverKey}
                        variant="contained"
                        disabled={!recoveryAnswer}
                    >
                        Recover Key
                    </Button>
                )}
            </DialogActions>
        </Dialog>
        
        <KeyBackupDialog
            open={backupDialogOpen}
            onClose={() => setBackupDialogOpen(false)}
            onComplete={() => {
                loadKeys();
                setBackupDialogOpen(false);
            }}
            mode={backupMode}
        />
    );
};
