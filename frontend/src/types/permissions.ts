export type ResourceType = 
    | 'users'
    | 'mentors'
    | 'mentees'
    | 'sessions'
    | 'matches'
    | 'reports'
    | 'settings'
    | 'analytics';

export type PermissionAction = 
    | 'view'
    | 'create'
    | 'update'
    | 'delete'
    | 'approve'
    | 'reject'
    | 'manage';

export interface Permission {
    id: string;
    resource: ResourceType;
    action: PermissionAction;
    description: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserRole {
    userId: number;
    roleId: string;
    assignedAt: string;
    assignedBy: number;
}

export interface RoleWithUsers extends Role {
    users: {
        id: number;
        name: string;
        email: string;
        lastActive: string;
    }[];
}

export interface PermissionGroup {
    resource: ResourceType;
    permissions: Permission[];
}

export interface RoleCreateRequest {
    name: string;
    description: string;
    permissions: string[]; // Permission IDs
}

export interface RoleUpdateRequest extends RoleCreateRequest {
    id: string;
}

export interface UserRoleUpdateRequest {
    userId: number;
    roles: string[]; // Role IDs
}