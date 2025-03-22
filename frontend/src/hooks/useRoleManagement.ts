import { useState, useCallback, useEffect } from 'react';
import { 
    Role, 
    RoleCreateRequest, 
    RoleUpdateRequest,
    PermissionGroup,
    RoleWithUsers 
} from '../types/permissions';

export const useRoleManagement = () => {
    const [roles, setRoles] = useState<RoleWithUsers[]>([]);
    const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/roles');
            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }
            const data = await response.json();
            setRoles(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching roles');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPermissionGroups = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/permissions');
            if (!response.ok) {
                throw new Error('Failed to fetch permissions');
            }
            const data = await response.json();
            setPermissionGroups(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching permissions');
        }
    }, []);

    const createRole = useCallback(async (roleData: RoleCreateRequest) => {
        try {
            const response = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });

            if (!response.ok) {
                throw new Error('Failed to create role');
            }

            await fetchRoles();
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error creating role');
        }
    }, [fetchRoles]);

    const updateRole = useCallback(async (roleData: RoleUpdateRequest) => {
        try {
            const response = await fetch(`/api/admin/roles/${roleData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roleData),
            });

            if (!response.ok) {
                throw new Error('Failed to update role');
            }

            await fetchRoles();
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error updating role');
        }
    }, [fetchRoles]);

    const deleteRole = useCallback(async (roleId: string) => {
        try {
            const response = await fetch(`/api/admin/roles/${roleId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete role');
            }

            await fetchRoles();
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error deleting role');
        }
    }, [fetchRoles]);

    useEffect(() => {
        fetchRoles();
        fetchPermissionGroups();
    }, [fetchRoles, fetchPermissionGroups]);

    return {
        roles,
        permissionGroups,
        loading,
        error,
        createRole,
        updateRole,
        deleteRole,
    };
};