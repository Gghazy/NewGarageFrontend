import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpContext,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppConfig } from '../config/config';
import { CONFIG_KEYS } from '../constants/app.constants';

type ResponseType = 'json' | 'blob' | 'text' | 'arraybuffer';

export interface RequestOptions {
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  responseType?: ResponseType;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    private readonly appConfig: AppConfig,
  ) {
    const root = String(this.appConfig.setting?.[CONFIG_KEYS.PATH_API] ?? '').replace(/\/+$/, '');
    this.baseUrl = `${root}/api/`;
  }

  get<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  post<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.request<T>('POST', url, body, options);
  }

  put<T>(url: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.request<T>('PUT', url, body, options);
  }

  delete<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  upload<T>(url: string, formData: FormData, options?: RequestOptions): Observable<T> {
    return this.request<T>('POST', url, formData, options);
  }

  getFile(url: string, options?: Omit<RequestOptions, 'responseType'>): Observable<Blob> {
    return this.request<Blob>('GET', url, undefined, { ...options, responseType: 'blob' });
  }

  getText(url: string, options?: Omit<RequestOptions, 'responseType'>): Observable<string> {
    return this.request<string>('GET', url, undefined, { ...options, responseType: 'text' });
  }

  export(url: string, filter: unknown, options?: Omit<RequestOptions, 'responseType'>): Observable<Blob> {
    return this.request<Blob>('POST', url, filter, { ...options, responseType: 'blob' });
  }

  private request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Observable<T> {
    const fullUrl = this.buildUrl(url);

    // HttpClient overloads require a cast when responseType is dynamic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseType = (options.responseType ?? 'json') as any;

    return this.http.request<T>(method, fullUrl, {
      body,
      params: options.params as HttpParams,
      headers: options.headers as HttpHeaders,
      context: options.context,
      responseType,
    }).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private buildUrl(url: string): string {
    const clean = String(url ?? '').replace(/^\/+/, '');
    return `${this.baseUrl}${clean}`;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[ApiService]', error);
    return throwError(() => error);
  }
}
