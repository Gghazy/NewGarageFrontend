import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    const token = this.auth.getToken();

    const authReq =
      token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // Handle 401 Unauthorized - Token expired or invalid
        if (err.status === 401) {
          this.auth.clear();
          this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
        }
        // Handle 403 Forbidden - User doesn't have permission
        if (err.status === 403) {
          this.router.navigate(['/unauthorized']);
        }
        return throwError(() => err);
      })
    );
  }
}
