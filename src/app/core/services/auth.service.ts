import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type JwtPayload = {
  sub?: string | string[];
  email?: string | string[];
  exp?: number;

  permissions?: string[] | string;
  permission?: string[] | string;

  roles?: string[] | string;
  role?: string[] | string;

  [key: string]: any;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;
  private readonly storageKey = 'token';

  readonly isAuthenticated = signal<boolean>(false);

  private payload: any | null = null;
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
    debugger
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
    const p = this.decode<JwtPayload>();
    const claims = p?.permissions ?? p?.permission; 
    return this.toStringArray(claims);
  }

  getRoles(): string[] {
    const p = this.decode<JwtPayload>();
    const claims = p?.roles ?? p?.role;
    return this.toStringArray(claims);
  }

  hasPermission(permission: string): boolean {

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
    const p = this.decode<JwtPayload>(token);
    if (!p?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return p.exp <= now;
  }

  hasValidToken(): boolean {
    const t = this.getToken();
    if (!t) return false;
    this.loadFromToken();
    return !this.isTokenExpired(t);
  }

  setLang(lang: 'ar' | 'en'): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem('lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    } catch {
      // ignore
    }
  }

  getLang(defaultLang: 'ar' | 'en' = 'ar'): 'ar' | 'en' {
    if (!this.isBrowser) return defaultLang;

    const v = (localStorage.getItem('lang') ?? defaultLang).toLowerCase();
    return v === 'en' ? 'en' : 'ar';
  }

  private toStringArray(value?: string[] | string): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);

    // لو جاية string "a,b,c"
    return String(value)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private base64UrlDecode(input: string): string {
    // base64url -> base64
    const base64 = input
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(input.length / 4) * 4, '=');

    // Browser
    if (this.isBrowser && typeof atob === 'function') {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    // Node (لو حصل تشغيل SSR لأي سبب)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = globalThis as any;
    if (g?.Buffer) {
      return g.Buffer.from(base64, 'base64').toString('utf-8');
    }

    // Fallback
    return '';
  }

  private loadFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('[AuthService] Invalid token format');
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      if (!payload || typeof payload !== 'object') {
        console.warn('[AuthService] Invalid token payload');
        return;
      }

      this.payload = payload;

      this.userName.set(payload.unique_name || payload.name || '');
      this.email.set(payload.email || '');
      this.employeeName.set(
        payload.employee_name_ar || payload.employee_name_en || payload.name || ''
      );
    } catch (error) {
      console.error('[AuthService] Failed to load token payload:', error);
      this.payload = null;
    }
  }
}
