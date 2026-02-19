import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: false
})
export class Login {
  username = '';
  password = '';

  loading = false;
  errorMsg = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

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
          debugger
          this.authService.setToken(res.data.accessToken);
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/features';
          
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.errorMsg = err?.error?.message ?? 'Login failed';
        },
      });
  }
}
