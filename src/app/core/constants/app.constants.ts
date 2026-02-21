export const APP_ROUTES = {
  AUTH_LOGIN: '/auth/login',
  FEATURES: '/features',
  UNAUTHORIZED: '/features/unauthorized',
  UNAUTHORIZED_SHORT: '/unauthorized',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  LANG: 'lang',
} as const;

export const JWT_CLAIMS = {
  SUB: 'sub',
  EMAIL: 'email',
  UNIQUE_NAME: 'unique_name',
  NAME: 'name',
  EMPLOYEE_NAME_AR: 'employee_name_ar',
  EMPLOYEE_NAME_EN: 'employee_name_en',
  PERMISSIONS: 'permissions',
  PERMISSION: 'permission',
  ROLES: 'roles',
  ROLE: 'role',
} as const;

export const SUPPORTED_LANGS = {
  AR: 'ar',
  EN: 'en',
} as const;

export type SupportedLang = (typeof SUPPORTED_LANGS)[keyof typeof SUPPORTED_LANGS];

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;

export const PERMISSION_MODE = {
  ANY: 'any',
  ALL: 'all',
} as const;

export type PermissionMode = (typeof PERMISSION_MODE)[keyof typeof PERMISSION_MODE];

export const CONFIG_KEYS = {
  PATH_API: 'PathAPI',
} as const;
