import {store} from '../store';

// Helper function to get current permissions from Redux store
export const getCurrentPermissions = (): string[] => {
  const state = store.getState();
  return state.auth.permissions || [];
};

// Check if user has a specific permission
export const hasPermission = (permission: string): boolean => {
  const permissions = getCurrentPermissions();
  return permissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (permissionsList: string[]): boolean => {
  const permissions = getCurrentPermissions();
  return permissionsList.some(permission => permissions.includes(permission));
};

// Check if user has all of the specified permissions
export const hasAllPermissions = (permissionsList: string[]): boolean => {
  const permissions = getCurrentPermissions();
  return permissionsList.every(permission => permissions.includes(permission));
};

// Check permissions for specific modules
export const canViewExperiment = (): boolean => {
  return hasAnyPermission([
    'line-development:experiment:view',
    'hybrid-development:experiment:view',
    'trial:view',
    'phenoScreening:view',
    'dus-testing:view',
  ]);
};

export const canEditExperiment = (): boolean => {
  return hasAnyPermission([
    'line-development:experiment:edit',
    'hybrid-development:experiment:edit',
    'trial:edit',
    'phenoScreening:edit',
    'dus-testing:edit',
  ]);
};

export const canCreateExperiment = (): boolean => {
  return hasAnyPermission([
    'line-development:experiment:create',
    'hybrid-development:experiment:create',
    'trial:create',
    'phenoScreening:create',
    'dus-testing:create',
  ]);
};

export const canDeleteExperiment = (): boolean => {
  return hasAnyPermission([
    'line-development:experiment:delete',
    'hybrid-development:experiment:delete',
    'trial:delete',
    'phenoScreening:delete',
    'dus-testing:delete',
  ]);
};

export const canViewLandVillage = (): boolean => {
  return hasPermission('landVillage:view');
};

export const canEditLandVillage = (): boolean => {
  return hasPermission('landVillage:edit');
};

export const canCreateLandVillage = (): boolean => {
  return hasPermission('landVillage:create');
};

export const canDeleteLandVillage = (): boolean => {
  return hasPermission('landVillage:delete');
};

export const canViewUsers = (): boolean => {
  return hasPermission('user:view');
};

export const canEditUsers = (): boolean => {
  return hasPermission('user:edit');
};

export const canCreateUsers = (): boolean => {
  return hasPermission('user:create');
};

export const canDeleteUsers = (): boolean => {
  return hasPermission('user:delete');
};

export const canViewPhenotype = (): boolean => {
  return hasPermission('phenotype:view');
};

export const canViewGermplasm = (): boolean => {
  return hasPermission('germplasm:view');
};

export const canEditGermplasm = (): boolean => {
  return hasPermission('germplasm:edit');
};

export const canCreateGermplasm = (): boolean => {
  return hasPermission('germplasm:create');
};

export const canViewTraits = (): boolean => {
  return hasPermission('trait:view');
};

export const canEditTraits = (): boolean => {
  return hasPermission('trait:edit');
};

export const canCreateTraits = (): boolean => {
  return hasPermission('trait:create');
};

export const canDeleteTraits = (): boolean => {
  return hasPermission('trait:delete');
};

export const canViewCrops = (): boolean => {
  return hasPermission('crop:view');
};

export const canEditCrops = (): boolean => {
  return hasPermission('crop:edit');
};

export const canCreateCrops = (): boolean => {
  return hasPermission('crop:create');
};

export const canDeleteCrops = (): boolean => {
  return hasPermission('crop:delete');
};

export const canViewNotes = (): boolean => {
  return hasPermission('notes:view');
};

export const canEditNotes = (): boolean => {
  return hasPermission('notes:edit');
};

export const canCreateNotes = (): boolean => {
  return hasPermission('notes:create');
};

export const canDeleteNotes = (): boolean => {
  return hasPermission('notes:delete');
};

export const canViewVisits = (): boolean => {
  return hasPermission('visits:view');
};

export const canEditVisits = (): boolean => {
  return hasPermission('visits:edit');
};

export const canCreateVisits = (): boolean => {
  return hasPermission('visits:create');
};

export const canDeleteVisits = (): boolean => {
  return hasPermission('visits:delete');
};

export const canViewFieldbook = (): boolean => {
  return hasPermission('fieldbook:view');
};

export const canEditFieldbook = (): boolean => {
  return hasPermission('fieldbook:edit');
};

// Extract permissions from user data (to be used during login)
export const extractPermissionsFromUser = (userData: any): string[] => {
  try {
    if (!userData?.role || !Array.isArray(userData.role)) {
      return [];
    }

    const allPermissions: string[] = [];

    userData.role.forEach((roleItem: any) => {
      if (roleItem?.permissions && Array.isArray(roleItem.permissions)) {
        allPermissions.push(...roleItem.permissions);
      }
    });

    // Remove duplicates and return
    return [...new Set(allPermissions)];
  } catch (error) {
    return [];
  }
};
