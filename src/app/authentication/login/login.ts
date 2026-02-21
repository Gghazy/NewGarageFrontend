import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: false
})
export class Login {
  username = '';
  password = '';
  showPassword = false;

  loading = false;
  errorMsg = '';
  readonly currentYear = new Date().getFullYear();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    this.errorMsg = '';

    if (!this.username.trim() || !this.password) {
      this.errorMsg = 'Username & password are required';
      return;
    }

    this.loading = true;

    this.apiService.post('auth/login', { email: this.username.trim(), password: this.password })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.authService.setToken(res.data.accessToken);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/features';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMsg = err?.error?.message ?? 'Login failed. Please check your credentials.';
        },
      });
  }
}
