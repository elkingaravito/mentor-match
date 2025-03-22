import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Chip,
    IconButton,
    Alert,
    Tooltip,
    Grid,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Security as SecurityIcon,
    Group as GroupIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useRoleManagement } from '../../hooks/useRoleManagement';
import { Role, Permission, PermissionGroup, ResourceType } from '../../types/permissions';
import { LoadingButton } from '../feedback/LoadingButton';

interface RoleDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (role: { name: string; description: string; permissions: string[] }) => void;
    role?: Role;
    permissionGroups: PermissionGroup[];
}

const RoleDialog: React.FC<RoleDialogProps> = ({
    open,
    onClose,
    onSubmit,
    role,
    permissionGroups,
}) => {
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        role?.permissions.map(p => p.id) || []
    );

    const handleSubmit = () => {
        onSubmit({
            name,
            description,
            permissions: selectedPermissions,
        });
        onClose();
    };

    const handlePermissionToggle = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleResourceToggle = (resource: ResourceType) => {
        const resourcePermissions = permissionGroups
            .find(g => g.resource === resource)
            ?.permissions.map(p => p.id) || [];

        setSelectedPermissions(prev => {
            const hasAllPermissions = resourcePermissions.every(id => prev.includes(id));
            return hasAllPermissions
                ? prev.filter(id => !resourcePermissions.includes(id))
                : [...new Set([...prev, ...resourcePermissions])];
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {role ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Role Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Typography variant="h6" gutterBottom>
                        Permissions
                    </Typography>
                    {permissionGroups.map((group) => (
                        <Box key={group.resource} sx={{ mb: 2 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={group.permissions.every(p => 
                                                selectedPermissions.includes(p.id)
                                            )}
                                            indeterminate={
                                                group.permissions.some(p => 
                                                    selectedPermissions.includes(p.id)
                                                ) &&
                                                !group.permissions.every(p => 
                                                    selectedPermissions.includes(p.id)
                                                )
                                            }
                                            onChange={() => handleResourceToggle(group.resource)}
                                        />
                                    }
                                    label={group.resource.charAt(0).toUpperCase() + group.resource.slice(1)}
                                />
                            </Box>
                            <Box display="flex" flexWrap="wrap" gap={1} ml={4}>
                                {group.permissions.map((permission) => (
                                    <FormControlLabel
                                        key={permission.id}
                                        control={
                                            <Checkbox
                                                checked={selectedPermissions.includes(permission.id)}
                                                onChange={() => handlePermissionToggle(permission.id)}
                                            />
                                        }
                                        label={
                                            <Tooltip title={permission.description}>
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    {permission.action}
                                                    <InfoIcon fontSize="small" color="action" />
                                                </Box>
                                            </Tooltip>
                                        }
                                    />
                                ))}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!name || selectedPermissions.length === 0}
                >
                    {role ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const RoleManagement: React.FC = () => {
    const {
        roles,
        permissionGroups,
        loading,
        error,
        createRole,
        updateRole,
        deleteRole,
    } = useRoleManagement();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>();

    const handleCreateRole = async (roleData: {
        name: string;
        description: string;
        permissions: string[];
    }) => {
        await createRole(roleData);
        setDialogOpen(false);
    };

    const handleUpdateRole = async (roleData: {
        name: string;
        description: string;
        permissions: string[];
    }) => {
        if (selectedRole) {
            await updateRole({
                id: selectedRole.id,
                ...roleData,
            });
        }
        setDialogOpen(false);
        setSelectedRole(undefined);
    };

    const handleDeleteRole = async (role: Role) => {
        if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            await deleteRole(role.id);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Role Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedRole(undefined);
                        setDialogOpen(true);
                    }}
                >
                    Create Role
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Role Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Permissions</TableCell>
                            <TableCell>Users</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <SecurityIcon 
                                            color={role.isSystem ? 'primary' : 'action'} 
                                            fontSize="small" 
                                        />
                                        {role.name}
                                        {role.isSystem && (
                                            <Chip 
                                                label="System" 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined" 
                                            />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                        {role.permissions.map((permission) => (
                                            <Tooltip 
                                                key={permission.id}
                                                title={permission.description}
                                            >
                                                <Chip
                                                    label={`${permission.resource}:${permission.action}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        icon={<GroupIcon />}
                                        label={`${(role as RoleWithUsers).users?.length || 0} users`}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setDialogOpen(true);
                                        }}
                                        disabled={role.isSystem}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteRole(role)}
                                        disabled={role.isSystem}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <RoleDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedRole(undefined);
                }}
                onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
                role={selectedRole}
                permissionGroups={permissionGroups}
            />
        </Box>
    );
};