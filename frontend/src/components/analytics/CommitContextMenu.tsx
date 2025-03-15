import React from 'react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Merge as MergeIcon,
    CallSplit as BranchIcon,
    Restore as RestoreIcon,
    Label as TagIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';

interface CommitContextMenuProps {
    commit: any | null;
    anchorPosition: { x: number; y: number } | null;
    onClose: () => void;
    onAction: (action: string, commit: any) => void;
}

export const CommitContextMenu: React.FC<CommitContextMenuProps> = ({
    commit,
    anchorPosition,
    onClose,
    onAction
}) => {
    if (!commit || !anchorPosition) return null;

    return (
        <Menu
            open={true}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
        >
            <MenuItem onClick={() => onAction('createBranch', commit)}>
                <ListItemIcon>
                    <BranchIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Create Branch Here</ListItemText>
            </MenuItem>
            
            <MenuItem onClick={() => onAction('merge', commit)}>
                <ListItemIcon>
                    <MergeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Merge into Current Branch</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => onAction('restore', commit)}>
                <ListItemIcon>
                    <RestoreIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Restore to This Version</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => onAction('tag', commit)}>
                <ListItemIcon>
                    <TagIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add Tag</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => onAction('copy', commit)}>
                <ListItemIcon>
                    <CopyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy Commit ID</ListItemText>
            </MenuItem>
        </Menu>
    );
};