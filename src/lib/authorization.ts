// src/lib/authorization.ts

// Define user roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

// Define permissions
export enum Permission {
  // User management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Product management
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  
  // Category management
  CATEGORY_CREATE = 'category:create',
  CATEGORY_READ = 'category:read',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',
  
  // Analytics and reports
  ANALYTICS_READ = 'analytics:read',
  REPORTS_READ = 'reports:read',
  
  // Settings
  SETTINGS_UPDATE = 'settings:update',
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admins have all permissions
  [UserRole.MANAGER]: [
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_READ,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.CATEGORY_CREATE,
    Permission.CATEGORY_READ,
    Permission.CATEGORY_UPDATE,
    Permission.ANALYTICS_READ,
    Permission.REPORTS_READ,
  ],
  [UserRole.USER]: [
    Permission.PRODUCT_READ,
    Permission.CATEGORY_READ,
    Permission.ANALYTICS_READ,
    Permission.REPORTS_READ,
  ],
  [UserRole.VIEWER]: [
    Permission.PRODUCT_READ,
    Permission.CATEGORY_READ,
  ],
};

// User interface
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Check if a user has a specific permission
export function hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

// Check if a user has any of the specified permissions
export function hasAnyPermission(user: AuthenticatedUser, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

// Check if a user has all of the specified permissions
export function hasAllPermissions(user: AuthenticatedUser, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

// Check user role
export function hasRole(user: AuthenticatedUser, role: UserRole): boolean {
  return user.role === role;
}

// Check if user has any of the specified roles (for hierarchical access)
export function hasAnyRole(user: AuthenticatedUser, roles: UserRole[]): boolean {
  return roles.includes(user.role);
}

// Check if user has admin role
export function isAdmin(user: AuthenticatedUser): boolean {
  return hasRole(user, UserRole.ADMIN);
}

// Check if user has manager role or above
export function isManagerOrAbove(user: AuthenticatedUser): boolean {
  return hasAnyRole(user, [UserRole.ADMIN, UserRole.MANAGER]);
}

// Resource ownership check
export function isOwner(resourceOwnerId: string, currentUserId: string): boolean {
  return resourceOwnerId === currentUserId;
}

// Enhanced access control function that checks both role and resource ownership
export function canAccessResource(
  user: AuthenticatedUser,
  requiredPermission: Permission,
  resourceOwnerId?: string
): boolean {
  // Check basic permission
  if (hasPermission(user, requiredPermission)) {
    return true;
  }
  
  // If resource owner ID is provided, check ownership
  if (resourceOwnerId) {
    // Users can access their own resources
    if (isOwner(resourceOwnerId, user.id)) {
      // But they still need the read permission at minimum
      return hasPermission(user, Permission.PRODUCT_READ);
    }
  }
  
  return false;
}

// Access control middleware-like function for API routes
export function requirePermission(user: AuthenticatedUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Access denied: User does not have permission '${permission}'`);
  }
}

// Access control for specific resource operations
export function requireResourceAccess(
  user: AuthenticatedUser,
  requiredPermission: Permission,
  resourceOwnerId?: string
): void {
  if (!canAccessResource(user, requiredPermission, resourceOwnerId)) {
    throw new Error(`Access denied: Insufficient permissions for this resource`);
  }
}