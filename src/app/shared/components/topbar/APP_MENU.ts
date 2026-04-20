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
      // — Branches & Operations —
      { labelKey: 'MENU.BRANCHES', route: '/features/settings/branches', icon: 'bi bi-diagram-3', permissions: ['branches.read'] },
      { labelKey: 'MENU.CRANES', route: '/features/settings/cranes', icon: 'bi bi-truck', permissions: ['crane.read'] },
      // — Vehicles —
      { labelKey: 'MENU.MANUFACTURERS', route: '/features/settings/manufacturers', icon: 'bi bi-building', permissions: ['manufacturer.read'] },
      { labelKey: 'MENU.CAR_MARKS', route: '/features/settings/car-marks', icon: 'bi bi-badge-tm', permissions: ['carMark.read'] },
      // — Services & Pricing —
      { labelKey: 'MENU.SERVICES', route: '/features/settings/services', icon: 'bi bi-tools', permissions: ['service.read'] },
      { labelKey: 'MENU.SERVICE_PRICES', route: '/features/settings/service-prices', icon: 'bi bi-cash-stack', permissions: ['servicePrice.read'] },
      { labelKey: 'MENU.SERVICE_DISCOUNTS', route: '/features/settings/service-discounts', icon: 'bi bi-percent', permissions: ['serviceDiscount.read'] },
      { labelKey: 'MENU.SERVICE_POINT_RULES', route: '/features/settings/service-point-rules', icon: 'bi bi-star', permissions: ['servicePointRule.read'] },
      // — Payment & Terms —
      { labelKey: 'MENU.PAYMENT_METHODS', route: '/features/settings/payment-methods', icon: 'bi bi-credit-card', permissions: ['paymentMethod.read'] },
      { labelKey: 'MENU.TERMS', route: '/features/settings/terms', icon: 'bi bi-file-text', permissions: ['term.read'] },
    ],
  },
  {
    labelKey: 'MENU.EXAMINATION_MANAGEMENT',
    icon: 'bi bi-clipboard-check',
    permissions: ['examination.read'],
    children: [
      // — Sensor Stage —
      { labelKey: 'MENU.SENSOR_ISSUES', route: '/features/examination-management/sensor-issues', icon: 'bi bi-cpu', permissions: ['sensorIssue.read'] },
      // — Mechanical Stage —
      { labelKey: 'MENU.MECH_PARTS', route: '/features/examination-management/mech-parts', icon: 'bi bi-gear-wide-connected', permissions: ['mechPart.read'] },
      { labelKey: 'MENU.MECH_PART_TYPES', route: '/features/examination-management/mech-part-types', icon: 'bi bi-diagram-2', permissions: ['mechPartType.read'] },
      { labelKey: 'MENU.MECH_ISSUES', route: '/features/examination-management/mech-issues', icon: 'bi bi-exclamation-triangle', permissions: ['mechIssue.read'] },
      // — Interior Body Stage —
      { labelKey: 'MENU.INTERIOR_BODY_PART', route: '/features/examination-management/interior-body-parts', icon: 'bi bi-box', permissions: ['interiorBodyPart.read'] },
      { labelKey: 'MENU.INTERIOR_BODY_ISSUES', route: '/features/examination-management/interior-body-issues', icon: 'bi bi-layout-text-window', permissions: ['interiorBodyIssue.read'] },
      // — Exterior Body Stage —
      { labelKey: 'MENU.EXTERIOR_BODY_PART', route: '/features/examination-management/exterior-body-parts', icon: 'bi bi-box-fill', permissions: ['exteriorBodyPart.read'] },
      { labelKey: 'MENU.EXTERIOR_BODY_ISSUES', route: '/features/examination-management/exterior-body-issues', icon: 'bi bi-car-front-fill', permissions: ['exteriorBodyIssue.read'] },
      // — Accessory Stage —
      { labelKey: 'MENU.ACCESSORY_PART', route: '/features/examination-management/accessory-parts', icon: 'bi bi-puzzle', permissions: ['accessoryPart.read'] },
      { labelKey: 'MENU.ACCESSORY_ISSUES', route: '/features/examination-management/accessory-issues', icon: 'bi bi-usb-symbol', permissions: ['accessoryIssue.read'] },
      // — Inside & Decor Stage —
      { labelKey: 'MENU.INSIDE_AND_DECOR_PART', route: '/features/examination-management/inside-and-decor-parts', icon: 'bi bi-palette', permissions: ['insideAndDecorPart.read'] },
      { labelKey: 'MENU.INSIDE_AND_DECOR_PART_ISSUE', route: '/features/examination-management/inside-and-decor-part-issues', icon: 'bi bi-palette2', permissions: ['insideAndDecorPartIssue.read'] },
      // — Road Test Stage —
      { labelKey: 'MENU.ROAD_TEST_ISSUES', route: '/features/examination-management/road-test-issues', icon: 'bi bi-sign-turn-right', permissions: ['roadTestIssue.read'] },
      { labelKey: 'MENU.ROAD_TEST_ISSUE_TYPES', route: '/features/examination-management/road-test-issue-types', icon: 'bi bi-sign-turn-right-fill', permissions: ['roadTestIssueType.read'] },
    ],
  },
  {
    labelKey: 'MENU.USERS',
    icon: 'bi bi-people',
    permissions: ['users.read'],
    children: [
      { labelKey: 'MENU.EMPLOYEES', route: '/features/users/employees', icon: 'bi bi-person-badge', permissions: ['employees.read'] },
      { labelKey: 'MENU.ROLES', route: '/features/users/roles', icon: 'bi bi-shield-lock', permissions: ['roles.read'] },
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
      { labelKey: 'MENU.INVOICE_REFUNDS', route: '/features/invoices/refunds', icon: 'bi bi-arrow-return-left', permissions: ['invoice.read'] },
    ],
  },
  {
    labelKey: 'MENU.BOOKINGS',
    icon: 'bi bi-calendar-check',
    permissions: ['booking.read'],
    children: [
      { labelKey: 'MENU.BOOKINGS', route: '/features/bookings', icon: 'bi bi-calendar-check', permissions: ['booking.read'] },
    ],
  },
  {
    labelKey: 'MENU.REPORTS',
    icon: 'bi bi-bar-chart-line',
    permissions: ['invoice.read', 'examination.report', 'dashboard.revenue'],
    children: [
      { labelKey: 'MENU.INVOICE_REPORT', route: '/features/reports/invoices', icon: 'bi bi-receipt-cutoff', permissions: ['invoice.read'] },
      { labelKey: 'MENU.EMPLOYEE_REPORT', route: '/features/reports/employees', icon: 'bi bi-person-lines-fill', permissions: ['examination.read'] },
      { labelKey: 'MENU.REVENUE_COMPARISON', route: '/features/reports/revenue-comparison', icon: 'bi bi-graph-up-arrow', permissions: ['dashboard.revenue'] },
      { labelKey: 'MENU.EMPLOYEE_COMPARISON', route: '/features/reports/employee-comparison', icon: 'bi bi-people', permissions: ['examination.read'] },
    ],
  },
];
