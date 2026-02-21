import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { JWT_CLAIMS, STORAGE_KEYS } from '../constants/app.constants';

export interface JwtPayload {
  sub?: string | string[];
  email?: string | string[];
  exp?: number;
  unique_name?: string;
  name?: string;
  employee_name_ar?: string;
  employee_name_en?: string;
  permissions?: string[] | string;
  permission?: string[] | string;
  roles?: string[] | string;
  role?: string[] | string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;
  private readonly storageKey = STORAGE_KEYS.TOKEN;

  readonly isAuthenticated = signal<boolean>(false);

  private payload: JwtPayload | null = null;
  employeeName = signal<string>('');
  userName = signal<string>('');
  email = signal<string>('');

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isAuthenticated.set(this.hasValidToken());
  }

  private get storage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }

  getToken(): string | null {
    return this.storage?.getItem(this.storageKey) ?? null;
  }

  setToken(token: string | null): void {
    if (!this.isBrowser) return;

    if (token) this.storage!.setItem(this.storageKey, token);
    else this.storage!.removeItem(this.storageKey);

    this.isAuthenticated.set(this.hasValidToken());
  }

  clear(): void {
    if (!this.isBrowser) return;

    this.storage!.removeItem(this.storageKey);
    this.isAuthenticated.set(false);
  }

  decode<T = JwtPayload>(token?: string | null): T | null {
    try {
      const t = token ?? this.getToken();
      if (!t) return null;

      const parts = t.split('.');
      if (parts.length < 2) return null;

      const payloadPart = parts[1];
      const json = this.base64UrlDecode(payloadPart);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  getPermissions(): string[] {
    const payload = this.decode<JwtPayload>();
    const claims = payload?.[JWT_CLAIMS.PERMISSIONS] ?? payload?.[JWT_CLAIMS.PERMISSION];
    return this.toStringArray(claims as string | string[] | undefined);
  }

  getRoles(): string[] {
    const payload = this.decode<JwtPayload>();
    const claims = payload?.[JWT_CLAIMS.ROLES] ?? payload?.[JWT_CLAIMS.ROLE];
    return this.toStringArray(claims as string | string[] | undefined);
  }

  hasPermission(permission: string): boolean {
    debugger
    if (!permission) return false;
    const perms = this.getPermissions();
    return perms.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (!permissions?.length) return false;
    const perms = this.getPermissions();
    return permissions.some((p) => perms.includes(p));
  }

  hasRole(role: string): boolean {
    if (!role) return false;
    const roles = this.getRoles();
    return roles.includes(role);
  }

  isTokenExpired(token?: string | null): boolean {
    const payload = this.decode<JwtPayload>(token);
    if (!payload?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  hasValidToken(): boolean {
    const t = this.getToken();
    if (!t) return false;
    this.loadFromToken();
    return !this.isTokenExpired(t);
  }

  private toStringArray(value?: string[] | string): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);

    return String(value)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private base64UrlDecode(input: string): string {
    const base64 = input
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(input.length / 4) * 4, '=');

    if (this.isBrowser && typeof atob === 'function') {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    if (g?.Buffer) {
      return g.Buffer.from(base64, 'base64').toString('utf-8');
    }

    return '';
  }

  private loadFromToken(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = this.decode<JwtPayload>(token);
      if (!payload || typeof payload !== 'object') {
        console.warn('[AuthService] Invalid token payload');
        return;
      }

      this.payload = payload;

      this.userName.set(
        String(payload[JWT_CLAIMS.UNIQUE_NAME] ?? payload[JWT_CLAIMS.NAME] ?? '')
      );
      this.email.set(String(payload[JWT_CLAIMS.EMAIL] ?? ''));
      this.employeeName.set(
        String(
          payload[JWT_CLAIMS.EMPLOYEE_NAME_AR] ??
          payload[JWT_CLAIMS.EMPLOYEE_NAME_EN] ??
          payload[JWT_CLAIMS.NAME] ??
          ''
        )
      );
    } catch (error) {
      console.error('[AuthService] Failed to load token payload:', error);
      this.payload = null;
    }
  }
}
