export interface AppMenuItem {
  labelKey: string;
  icon?: string;                 
  route?: string;                
  permissions?: string[];        
  children?: AppMenuItem[];
}
export const APP_MENU: AppMenuItem[] = [
  {
    labelKey: 'MENU.SETTINGS',
    icon: 'bi bi-gear',
    permissions: ['settings.read'],
    children: [
      { labelKey: 'MENU.CAR_MARKS', route: '/features/settings/car-marks', icon: 'bi bi-badge-tm', permissions: ['carMark.read'] },
      { labelKey: 'MENU.MANUFACTURERS', route: '/features/settings/manufacturers', icon: 'bi bi-building', permissions: ['manufacturer.read'] },
      { labelKey: 'MENU.SERVICES', route: '/features/settings/services', icon: 'bi bi-tools', permissions: ['service.read'] },
      { labelKey: 'MENU.SERVICE_PRICES', route: '/features/settings/service-prices', icon: 'bi bi-cash-stack', permissions: ['servicePrice.read'] },
      { labelKey: 'MENU.CRANES', route: '/features/settings/cranes', icon: 'bi bi-truck', permissions: ['crane.read'] },
      { labelKey: 'MENU.TERMS', route: '/features/settings/terms', icon: 'bi bi-file-text', permissions: ['term.read'] },
      { labelKey: 'MENU.BRANCHES', route: '/features/settings/branches', icon: 'bi bi-diagram-3', permissions: ['branches.read'] },
      { labelKey: 'MENU.PAYMENT_METHODS', route: '/features/settings/payment-methods', icon: 'bi bi-credit-card', permissions: ['paymentMethod.read'] },
    ],
  },
  {
    labelKey: 'MENU.EXAMINATION_MANAGEMENT',
    icon: 'bi bi-clipboard-check',
    permissions: ['examination.read'],
    children: [
      { labelKey: 'MENU.SENSOR_ISSUES', route: '/features/examination-management/sensor-issues', icon: 'bi bi-cpu', permissions: ['sensorIssue.read'] },
      { labelKey: 'MENU.MECH_ISSUES', route: '/features/examination-management/mech-issues', icon: 'bi bi-gear-wide-connected', permissions: ['mechIssue.read'] },
      { labelKey: 'MENU.MECH_TYPE_ISSUES', route: '/features/examination-management/mech-type-issues', icon: 'bi bi-diagram-2', permissions: ['mechIssueType.read'] },
      { labelKey: 'MENU.INTERIOR_ISSUES', route: '/features/examination-management/interior-issues', icon: 'bi bi-car-front', permissions: ['interiorIssue.read'] },
      { labelKey: 'MENU.INTERIOR_BODY_ISSUES', route: '/features/examination-management/interior-body-issues', icon: 'bi bi-layout-text-window', permissions: ['interiorBodyIssue.read'] },
      { labelKey: 'MENU.EXTERIOR_BODY_ISSUES', route: '/features/examination-management/exterior-body-issues', icon: 'bi bi-car-front-fill', permissions: ['exteriorBodyIssue.read'] },
      { labelKey: 'MENU.ACCESSORY_ISSUES', route: '/features/examination-management/accessory-issues', icon: 'bi bi-usb-symbol', permissions: ['accessoryIssue.read'] },
      { labelKey: 'MENU.ROAD_TEST_ISSUES', route: '/features/examination-management/road-test-issues', icon: 'bi bi-sign-turn-right', permissions: ['roadTestIssue.read'] },
      { labelKey: 'MENU.INSIDE_AND_DECOR_PART', route: '/features/examination-management/inside-and-decor-parts', icon: 'bi bi-palette', permissions: ['insideAndDecorPart.read'] },
    ],
  },
  {
    labelKey: 'MENU.USERS',
    icon: 'bi bi-people',
    permissions: ['users.read'],
    children: [
      { labelKey: 'MENU.ROLES', route: '/features/users/roles', icon: 'bi bi-shield-lock', permissions: ['roles.read'] },
      { labelKey: 'MENU.EMPLOYEES', route: '/features/users/employees', icon: 'bi bi-person-badge', permissions: ['employees.read'] },
    ],
  },
  {
    labelKey: 'MENU.CLIENTS',
    icon: 'bi bi-person',
    permissions: ['clients.read'],
    children: [
      { labelKey: 'MENU.CLIENTS', route: '/features/management-clients/clients', icon: 'bi bi-person-check', permissions: ['clients.read'] },
      { labelKey: 'MENU.CLIENT_RESOURCES', route: '/features/management-clients/client-resources', icon: 'bi bi-person-workspace', permissions: ['clientResource.read'] },
    ],
  },

   {
    labelKey: 'MENU.VEHICLE_ORDERS',
    icon: 'bi bi-clipboard2-check',
    permissions: ['examination.read'],
    children: [
      { labelKey: 'MENU.VEHICLE_ORDERS', route: '/features/vehicle-orders', icon: 'bi bi-card-checklist', permissions: ['examination.read'] },
    ],
  },
  {
    labelKey: 'MENU.INVOICES',
    icon: 'bi bi-receipt',
    permissions: ['invoice.read'],
    children: [
      { labelKey: 'MENU.INVOICES', route: '/features/invoices', icon: 'bi bi-receipt-cutoff', permissions: ['invoice.read'] },
    ],
  },
];
  
