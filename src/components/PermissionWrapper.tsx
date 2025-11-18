import React from 'react';
import {View, Text} from 'react-native';
import {usePermissions} from '../hooks/usePermissions';

interface WithPermissionProps {
  requiredPermissions?: string[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission
  fallbackComponent?: React.ComponentType;
  children: React.ReactNode;
}

// HOC for wrapping components with permission checks
export const withPermission = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermissions: string[],
  requireAll: boolean = false,
) => {
  return (props: any) => {
    const {hasPermission, hasAnyPermission, hasAllPermissions} =
      usePermissions();

    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <Text style={{fontSize: 18, color: '#ff6b6b', textAlign: 'center'}}>
            Access Denied
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
              marginTop: 8,
            }}>
            You don't have permission to access this feature.
          </Text>
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Component for conditional rendering based on permissions
export const WithPermission: React.FC<WithPermissionProps> = ({
  requiredPermissions = [],
  requireAll = false,
  fallbackComponent: FallbackComponent,
  children,
}) => {
  const {hasAnyPermission, hasAllPermissions} = usePermissions();

  const hasAccess = requireAll
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }
    return null;
  }

  return <>{children}</>;
};

// Component for hiding/showing UI elements based on permissions
export const PermissionGate: React.FC<{
  permissions: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({permissions, requireAll = false, children, fallback = null}) => {
  const {hasAnyPermission, hasAllPermissions} = usePermissions();

  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
