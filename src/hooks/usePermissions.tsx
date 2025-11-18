import {useAppSelector} from '../store';

// Custom hook to use permissions in React components
export const usePermissions = () => {
  const permissions = useAppSelector(state => state.auth.permissions);

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionsList: string[]): boolean => {
    return permissionsList.some(permission => permissions.includes(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionsList: string[]): boolean => {
    return permissionsList.every(permission =>
      permissions.includes(permission),
    );
  };

  // Specific permission checks for common use cases
  const canViewExperiment = (): boolean => {
    return hasAnyPermission([
      'line-development:experiment:view',
      'hybrid-development:experiment:view',
      'trial:view',
      'phenoScreening:view',
      'dus-testing:view',
    ]);
  };

  const canEditExperiment = (): boolean => {
    return hasAnyPermission([
      'line-development:experiment:edit',
      'hybrid-development:experiment:edit',
      'trial:edit',
      'phenoScreening:edit',
      'dus-testing:edit',
    ]);
  };

  const canCreateExperiment = (): boolean => {
    return hasAnyPermission([
      'line-development:experiment:create',
      'hybrid-development:experiment:create',
      'trial:create',
      'phenoScreening:create',
      'dus-testing:create',
    ]);
  };

  const canDeleteExperiment = (): boolean => {
    return hasAnyPermission([
      'line-development:experiment:delete',
      'hybrid-development:experiment:delete',
      'trial:delete',
      'phenoScreening:delete',
      'dus-testing:delete',
    ]);
  };

  const canViewLandVillage = (): boolean => {
    return hasPermission('landVillage:view');
  };

  const canEditLandVillage = (): boolean => {
    return hasPermission('landVillage:edit');
  };

  const canCreateLandVillage = (): boolean => {
    return hasPermission('landVillage:create');
  };

  const canDeleteLandVillage = (): boolean => {
    return hasPermission('landVillage:delete');
  };

  const canViewUsers = (): boolean => {
    return hasPermission('user:view');
  };

  const canEditUsers = (): boolean => {
    return hasPermission('user:edit');
  };

  const canCreateUsers = (): boolean => {
    return hasPermission('user:create');
  };

  const canDeleteUsers = (): boolean => {
    return hasPermission('user:delete');
  };

  const canViewPhenotype = (): boolean => {
    return hasPermission('phenotype:view');
  };

  const canViewGermplasm = (): boolean => {
    return hasPermission('germplasm:view');
  };

  const canEditGermplasm = (): boolean => {
    return hasPermission('germplasm:edit');
  };

  const canCreateGermplasm = (): boolean => {
    return hasPermission('germplasm:create');
  };

  const canViewTraits = (): boolean => {
    return hasPermission('trait:view');
  };

  const canEditTraits = (): boolean => {
    return hasPermission('trait:edit');
  };

  const canCreateTraits = (): boolean => {
    return hasPermission('trait:create');
  };

  const canDeleteTraits = (): boolean => {
    return hasPermission('trait:delete');
  };

  const canViewCrops = (): boolean => {
    return hasPermission('crop:view');
  };

  const canEditCrops = (): boolean => {
    return hasPermission('crop:edit');
  };

  const canCreateCrops = (): boolean => {
    return hasPermission('crop:create');
  };

  const canDeleteCrops = (): boolean => {
    return hasPermission('crop:delete');
  };

  const canViewNotes = (): boolean => {
    return hasPermission('notes:view');
  };

  const canEditNotes = (): boolean => {
    return hasPermission('notes:edit');
  };

  const canCreateNotes = (): boolean => {
    return hasPermission('notes:create');
  };

  const canDeleteNotes = (): boolean => {
    return hasPermission('notes:delete');
  };

  const canViewVisits = (): boolean => {
    return hasPermission('visits:view');
  };

  const canEditVisits = (): boolean => {
    return hasPermission('visits:edit');
  };

  const canCreateVisits = (): boolean => {
    return hasPermission('visits:create');
  };

  const canDeleteVisits = (): boolean => {
    return hasPermission('visits:delete');
  };

  const canViewFieldbook = (): boolean => {
    return hasPermission('fieldbook:view');
  };

  const canEditFieldbook = (): boolean => {
    return hasPermission('fieldbook:edit');
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canViewExperiment,
    canEditExperiment,
    canCreateExperiment,
    canDeleteExperiment,
    canViewLandVillage,
    canEditLandVillage,
    canCreateLandVillage,
    canDeleteLandVillage,
    canViewUsers,
    canEditUsers,
    canCreateUsers,
    canDeleteUsers,
    canViewPhenotype,
    canViewGermplasm,
    canEditGermplasm,
    canCreateGermplasm,
    canViewTraits,
    canEditTraits,
    canCreateTraits,
    canDeleteTraits,
    canViewCrops,
    canEditCrops,
    canCreateCrops,
    canDeleteCrops,
    canViewNotes,
    canEditNotes,
    canCreateNotes,
    canDeleteNotes,
    canViewVisits,
    canEditVisits,
    canCreateVisits,
    canDeleteVisits,
    canViewFieldbook,
    canEditFieldbook,
  };
};
