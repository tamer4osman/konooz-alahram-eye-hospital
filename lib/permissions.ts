/**
 * Dashboard module permissions — granular read/write access per module.
 *
 * ADMIN role = full access to everything (bypasses checks).
 * STAFF role = permissions checked against this registry.
 */

export const DASHBOARD_MODULES = [
  'overview',
  'appointments',
  'clinical',
  'surgeries',
  'rooms',
  'beds',
  'personnel',
  'equipment',
  'billing',
  'analytics',
] as const;

export type DashboardModule = (typeof DASHBOARD_MODULES)[number];

export type ModuleAccess = 'read' | 'write';

/** Permissions map stored in StaffMember.permissions Json column. */
export type PermissionsMap = Partial<Record<DashboardModule, ModuleAccess>>;

/**
 * Default permission presets for quick staff provisioning.
 * Each preset grants 'read' + 'write' on the listed modules.
 */
export const ROLE_PRESETS: Record<string, PermissionsMap> = {
  manager: Object.fromEntries(DASHBOARD_MODULES.map((m) => [m, 'write' as const])),
  clinician: {
    overview: 'read',
    clinical: 'write',
    surgeries: 'read',
    rooms: 'read',
  },
  receptionist: {
    overview: 'read',
    appointments: 'write',
    rooms: 'read',
    beds: 'read',
    personnel: 'read',
  },
  accountant: {
    overview: 'read',
    billing: 'write',
  },
};

/**
 * Check whether a user has access to a given module at the required level.
 * - ADMIN role always passes.
 * - STAFF role requires the module to appear in permissions at 'read' or 'write'
 *   (write implies read).
 */
export function hasModuleAccess(
  role: string,
  permissions: unknown,
  module: DashboardModule,
  requiredLevel: ModuleAccess = 'read',
): boolean {
  if (role === 'ADMIN') return true;
  if (!permissions || typeof permissions !== 'object') return false;
  const map = permissions as PermissionsMap;
  const level = map[module];
  if (!level) return false;
  if (requiredLevel === 'read') return true; // read or write both satisfy read
  return level === 'write'; // write required → only 'write' satisfies
}
