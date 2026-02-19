import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: false,
  template: `
    <div class="container mt-5 text-center">
      <div class="row">
        <div class="col-md-8 mx-auto">
          <div class="error-template">
            <h1 class="display-1">❌ 403</h1>
            <h2>{{ 'COMMON.UNAUTHORIZED' | translate }}</h2>
            <div class="error-details mb-4">
              {{ 'COMMON.ACCESS_DENIED' | translate }}
            </div>
            <div class="error-actions">
              <button class="btn btn-primary me-2" (click)="goBack()">
                {{ 'COMMON.GO_BACK' | translate }}
              </button>
              <button class="btn btn-secondary" (click)="goHome()">
                {{ 'COMMON.GO_HOME' | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-template {
      padding: 40px 15px;
      text-align: center;
    }

    .error-details {
      font-size: 18px;
      color: #666;
    }

    .error-actions {
      margin-top: 15px;
    }
  `],
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/features']);
  }

  goHome(): void {
    this.router.navigate(['/features']);
  }
}
