export const ROLE_CONFIG = {
  parent: {
    label: 'Parent',
    dashboardPath: '/parent/dashboard',
    icon: 'Parent',
    value: 'Stay on top of results, fees, and daily student spending.',
  },
  teacher: {
    label: 'Teacher',
    dashboardPath: '/teacher/dashboard',
    icon: 'Teacher',
    value: 'Track student progress, results, and classroom visibility with less friction.',
  },
  admin: {
    label: 'School Admin',
    dashboardPath: '/admin/dashboard',
    icon: 'Admin',
    value: 'Manage operations, finances, and parent communication from one place.',
  },
}

export function getRoleConfig(role) {
  return ROLE_CONFIG[role] ?? null
}
