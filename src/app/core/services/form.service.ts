import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ApiError, ApiMessage } from 'src/app/shared/Models/api-response';

@Injectable({ providedIn: 'root' })
export class FormService {

  /**
   * Extracts error message from HttpErrorResponse
   * Backend errors: { code, message, traceId } or { code, errors: {...} }
   */
  extractError(err: unknown, fallback = 'An error occurred'): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as ApiError;

      // Validation errors with field details
      if (body?.errors) {
        const msgs = Object.values(body.errors).flat();
        return msgs.length ? msgs.join(', ') : (body.message ?? fallback);
      }

      return body?.message ?? err.message ?? fallback;
    }
    if (err instanceof Error) return err.message;
    return fallback;
  }

  /**
   * Handles POST/PUT submit - backend returns { message: "..." } on success
   */
  handleSubmit<T>(
    apiCall: Observable<T>,
    opts: {
      activeModal: NgbActiveModal;
      toastr: ToastrService;
      successMsg: string;
      errorFallback: string;
      setLoading: (v: boolean) => void;
      closeValue?: unknown;
    }
  ): void {
    opts.setLoading(true);

    apiCall.subscribe({
      next: (res) => {
        // Backend returns { message } on success for create/update
        const msg = (res as ApiMessage)?.message ?? opts.successMsg;
        opts.toastr.success(msg, 'Success');
        opts.activeModal.close(opts.closeValue ?? true);
      },
      error: (err) => {
        opts.toastr.error(this.extractError(err, opts.errorFallback), 'Error');
        opts.setLoading(false);
      }
    });
  }
}
