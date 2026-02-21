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
import { APP_ROUTES, HTTP_STATUS } from '../constants/app.constants';

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
        if (err.status === HTTP_STATUS.UNAUTHORIZED) {
          this.auth.clear();
          this.router.navigate([APP_ROUTES.AUTH_LOGIN], { queryParams: { returnUrl: this.router.url } });
        }
        if (err.status === HTTP_STATUS.FORBIDDEN) {
          this.router.navigate([APP_ROUTES.UNAUTHORIZED_SHORT]);
        }
        return throwError(() => err);
      })
    );
  }
}
