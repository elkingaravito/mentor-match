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
    Typography,
    Box,
    Chip,
    Stack,
    TextField,
    Menu,
    MenuItem,
    Tooltip,
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent
} from '@mui/material';
import {
    History as HistoryIcon,
    Restore as RestoreIcon,
    Compare as CompareIcon,
    Label as LabelIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { VersionManagementService } from '../../services/VersionManagementService';

interface VersionHistoryProps {
    open: boolean;
    onClose: () => void;
    onRestore: (versionId: string) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
    open,
    onClose,
    onRestore
}) => {
    const [versions, setVersions] = useState<BackupVersion[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [currentBranch, setCurrentBranch] = useState<string>('main');
    const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
    const [compareVersion, setCompareVersion] = useState<string | null>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const [newBranchName, setNewBranchName] = useState('');
    const [newBranchDescription, setNewBranchDescription] = useState('');

    useEffect(() => {
        if (open) {
            loadVersions();
        }
    }, [open]);

    const loadVersions = () => {
        const history = VersionManagementService.getVersionHistory();
        setVersions(history);
    };

    const handleCompare = async () => {
        if (selectedVersion && compareVersion) {
            try {
                const diff = await VersionManagementService.compareVersions(
                    selectedVersion,
                    compareVersion
                );
                setComparison(diff);
            } catch (error) {
                console.error('Version comparison failed:', error);
            }
        }
    };

    const handleAddTag = async () => {
        if (selectedVersion && newTag) {
            await VersionManagementService.tagVersion(selectedVersion, newTag);
            setTagDialogOpen(false);
            setNewTag('');
            loadVersions();
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Version History</Typography>
                    <Box display="flex" gap={1} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={currentBranch}
                                onChange={(e) => {
                                    const newBranch = e.target.value;
                                    VersionManagementService.switchBranch(newBranch)
                                        .then(() => {
                                            setCurrentBranch(newBranch);
                                            loadVersions();
                                        });
                                }}
                            >
                                {branches.map(branch => (
                                    <MenuItem key={branch.name} value={branch.name}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setBranchDialogOpen(true)}
                        >
                            New Branch
                        </Button>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <BranchGraph
                    commits={versions.map(v => ({
                        id: v.id,
                        message: v.description,
                        timestamp: v.timestamp,
                        branch: v.metadata?.branchName || 'main',
                        tags: v.tags,
                        parentIds: [v.metadata?.branchPoint, v.metadata?.mergePoint].filter(Boolean) as string[]
                    }))}
                    selectedCommit={selectedVersion}
                    onCommitSelect={setSelectedVersion}
                />
                <Box mt={2}>
                    <Timeline>
                    {versions.map((version, index) => (
                                                <TimelineItem 
                                                    key={version.id}
                                                    sx={{
                                                        '&:before': {
                                                            flex: 0,
                                                            padding: 0
                                                        }
                                                    }}
                                                >
                                                    <TimelineOppositeContent sx={{ flex: 0.2 }}>
                            <TimelineOppositeContent color="text.secondary">
                                {formatDate(version.timestamp)}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                                <TimelineDot color={index === 0 ? "primary" : "grey"} />
                                {index < versions.length - 1 && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                                                        <Box>
                                                                            <Typography variant="subtitle2">
                                                                                {version.description}
                                                                            </Typography>
                                                                            {version.metadata?.branchName && (
                                                                                <Chip
                                                                                    size="small"
                                                                                    label={version.metadata.branchName}
                                                                                    color={version.metadata.branchName === currentBranch ? "primary" : "default"}
                                                                                    sx={{ mr: 1, mt: 0.5 }}
                                                                                />
                                                                            )}
                                                                            {version.metadata?.branchPoint && (
                                                                                <Chip
                                                                                    size="small"
                                                                                    label="Branch Point"
                                                                                    color="info"
                                                                                    sx={{ mr: 1, mt: 0.5 }}
                                                                                />
                                                                            )}
                                                                            {version.metadata?.mergePoint && (
                                                                                <Chip
                                                                                    size="small"
                                                                                    label="Merge Point"
                                                                                    color="success"
                                                                                    sx={{ mr: 1, mt: 0.5 }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                        <Stack direction="row" spacing={1} mt={1}>
                                            <Chip
                                                size="small"
                                                label={`${version.keyCount} keys`}
                                            />
                                            <Chip
                                                size="small"
                                                label={formatSize(version.size)}
                                            />
                                            {version.changes && (
                                                <>
                                                    <Chip
                                                        size="small"
                                                        label={`+${version.changes.added}`}
                                                        color="success"
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`~${version.changes.modified}`}
                                                        color="warning"
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`-${version.changes.removed}`}
                                                        color="error"
                                                    />
                                                </>
                                            )}
                                        </Stack>
                                        <Stack direction="row" spacing={1} mt={1}>
                                            {version.tags.map(tag => (
                                                <Chip
                                                    key={tag}
                                                    size="small"
                                                    label={tag}
                                                    icon={<LabelIcon />}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                    <Box>
                                        <IconButton
                                            onClick={(e) => {
                                                setSelectedVersion(version.id);
                                                setMenuAnchor(e.currentTarget);
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>

                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                >
                    <MenuItem onClick={() => {
                        if (selectedVersion) onRestore(selectedVersion);
                        setMenuAnchor(null);
                    }}>
                        <ListItemIcon>
                            <RestoreIcon />
                        </ListItemIcon>
                        Restore this version
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setCompareVersion(selectedVersion);
                        setMenuAnchor(null);
                    }}>
                        <ListItemIcon>
                            <CompareIcon />
                        </ListItemIcon>
                        Compare with...
                    </MenuItem>
                    <MenuItem onClick={() => {
                        setTagDialogOpen(true);
                        setMenuAnchor(null);
                    }}>
                        <ListItemIcon>
                            <LabelIcon />
                        </ListItemIcon>
                        Add tag
                    </MenuItem>
                </Menu>

                <Dialog
                    open={tagDialogOpen}
                    onClose={() => setTagDialogOpen(false)}
                >
                    <DialogTitle>Add Tag</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Tag Name"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTagDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddTag} variant="contained">
                            Add Tag
                        </Button>
                    </DialogActions>
                </Dialog>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>

        <Dialog
            open={branchDialogOpen}
            onClose={() => setBranchDialogOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Create New Branch</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Branch Name"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    sx={{ mb: 2, mt: 1 }}
                />
                <TextField
                    fullWidth
                    label="Description"
                    value={newBranchDescription}
                    onChange={(e) => setNewBranchDescription(e.target.value)}
                    multiline
                    rows={2}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setBranchDialogOpen(false)}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={async () => {
                        if (selectedVersion) {
                            await VersionManagementService.createBranch(
                                newBranchName,
                                selectedVersion,
                                newBranchDescription
                            );
                            setBranchDialogOpen(false);
                            setNewBranchName('');
                            setNewBranchDescription('');
                            loadVersions();
                        }
                    }}
                    disabled={!newBranchName}
                >
                    Create Branch
                </Button>
            </DialogActions>
        </Dialog>
    );
};
