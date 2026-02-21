import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: false,
  template: `
    <div class="auth-bg d-flex align-items-center justify-content-center min-vh-100">
      <div class="auth-wrapper w-100">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-bg {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f4c75 100%);
      padding: 1.5rem;
    }
    .auth-wrapper {
      max-width: 440px;
      margin: 0 auto;
    }
  `]
})
export class AuthenticationLayout {}
