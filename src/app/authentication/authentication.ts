import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: false,
  template: `
    <div class="auth-bg d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div style="width:100%; max-width:400px;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host .auth-bg {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f4c75 100%);
    }
  `]
})
export class AuthenticationLayout {}
