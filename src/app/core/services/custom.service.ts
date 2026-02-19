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

type ResponseType = 'json' | 'blob' | 'text';

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
    const root = String(this.appConfig.setting?.['PathAPI'] ?? '').replace(/\/+$/, '');
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

    const responseType = (options.responseType ?? 'json') as any;

    return this.http.request<T>(method, fullUrl, {
      body,
      params: options.params as any,
      headers: options.headers as any,
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
    const isClient = error.error instanceof ErrorEvent;

    const message = isClient
      ? `Client error: ${error.error.message}`
      : `Server error (${error.status}): ${this.safeStringify(error.error)}`;

    console.error('[ApiService]', message);

    return throwError(() => new Error(message));
  }

  private safeStringify(value: unknown): string {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value); } catch { return String(value); }
  }
}
