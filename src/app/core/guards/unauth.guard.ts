import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class UnauthGuardService implements CanActivate {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    // SSR safe
    if (!isPlatformBrowser(this.platformId)) return true;

    if (!this.auth.hasValidToken()) return true;

    return this.router.createUrlTree(['/features']);
  }
}
