import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: false,
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class AuthenticationLayout {}
