import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    FormControl,
    FormControlLabel,
    RadioGroup,
    Radio,
    Switch,
    Typography,
    InputAdornment,
    Alert,
    Chip,
    IconButton,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Share as ShareIcon,
    ContentCopy as CopyIcon,
    QrCode as QrCodeIcon,
    Timer as TimerIcon,
    Public as PublicIcon,
    Lock as LockIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { ExportTemplate } from '../../services/templateService';
import { TemplateShareOptions, SharedTemplate } from '../../services/templateSharing';
import QRCode from 'qrcode.react';

interface TemplateSharingDialogProps {
    open: boolean;
    onClose: () => void;
    template: ExportTemplate;
    onShare: (options: TemplateShareOptions) => Promise<SharedTemplate>;
}

export const TemplateSharingDialog: React.FC<TemplateSharingDialogProps> = ({
    open,
    onClose,
    template,
    onShare
}) => {
    const theme = useTheme();
    const [accessLevel, setAccessLevel] = useState<TemplateShareOptions['accessLevel']>('private');
    const [allowCopy, setAllowCopy] = useState(true);
    const [allowModify, setAllowModify] = useState(false);
    const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined);
    const [showQRCode, setShowQRCode] = useState(false);
    const [shareUrl, setShareUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleShare = async () => {
        try {
            const sharedTemplate = await onShare({
                accessLevel,
                allowCopy,
                allowModify,
                expiresIn
            });
            
            const url = `${window.location.origin}/templates/shared/${sharedTemplate.shareId}`;
            setShareUrl(url);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to share template');
        }
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(shareUrl);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Share Template</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {template.name}
                    </Typography>

                    <FormControl component="fieldset">
                        <Typography variant="subtitle2" gutterBottom>
                            Access Level
                        </Typography>
                        <RadioGroup
                            value={accessLevel}
                            onChange={(e) => setAccessLevel(e.target.value as TemplateShareOptions['accessLevel'])}
                        >
                            <FormControlLabel
                                value="public"
                                control={<Radio />}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PublicIcon />
                                        <span>Public - Anyone can access</span>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                value="organization"
                                control={<Radio />}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BusinessIcon />
                                        <span>Organization - Only members can access</span>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                value="private"
                                control={<Radio />}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LockIcon />
                                        <span>Private - Only specific users can access</span>
                                    </Box>
                                }
                            />
                        </RadioGroup>
                    </FormControl>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={allowCopy}
                                    onChange={(e) => setAllowCopy(e.target.checked)}
                                />
                            }
                            label="Allow others to copy this template"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={allowModify}
                                    onChange={(e) => setAllowModify(e.target.checked)}
                                />
                            }
                            label="Allow others to modify this template"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TextField
                            label="Expires in (hours)"
                            type="number"
                            value={expiresIn || ''}
                            onChange={(e) => setExpiresIn(parseInt(e.target.value) || undefined)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TimerIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Leave empty for no expiration
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {shareUrl && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                value={shareUrl}
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Tooltip title="Copy URL">
                                                <IconButton onClick={handleCopyUrl}>
                                                    <CopyIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Show QR Code">
                                                <IconButton onClick={() => setShowQRCode(!showQRCode)}>
                                                    <QrCodeIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            {showQRCode && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <QRCode value={shareUrl} size={200} />
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    variant="contained"
                    onClick={handleShare}
                    startIcon={<ShareIcon />}
                    disabled={!accessLevel}
                >
                    Share Template
                </Button>
            </DialogActions>
        </Dialog>
    );
};