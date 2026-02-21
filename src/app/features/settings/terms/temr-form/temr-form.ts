import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { TermDto } from 'src/app/shared/Models/terms/term-dto';

@Component({
  selector: 'app-temr-form',
  standalone: false,
  templateUrl: './temr-form.html',
  styleUrl: './temr-form.css',
})
export class TemrForm implements OnInit, OnDestroy {
  data?: TermDto;
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [null as string | null],
    termsAndCondtionsAr: ['', [Validators.required]],
    termsAndCondtionsEn: ['', [Validators.required]],
    cancelWarrantyDocumentAr: ['', [Validators.required]],
    cancelWarrantyDocumentEn: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    this.getTerm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTerm() {
    // TermsController GET returns Success(result) -> { data: TermDto }
    this.apiService.get<ApiResponse<TermDto>>('terms')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.form.patchValue(res.data);
        },
        error: (err) => {
          // 404 is ok - term might not exist yet
          console.error('[TermForm] Failed to load term:', err);
        }
      });
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[controlName];
    return !!(c.invalid && (c.touched || c.dirty));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const value: TermDto = {
      termsAndCondtionsAr: this.form.value.termsAndCondtionsAr!,
      termsAndCondtionsEn: this.form.value.termsAndCondtionsEn!,
      cancelWarrantyDocumentAr: this.form.value.cancelWarrantyDocumentAr!,
      cancelWarrantyDocumentEn: this.form.value.cancelWarrantyDocumentEn!,
      id: this.form.value.id!,
    };

    const apiCall = value.id
      ? this.apiService.put(`Terms/${value.id}`, value)
      : this.apiService.post('Terms', value);

    apiCall.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Returns { message: "..." }
        this.toastr.success(res?.message ?? (value.id ? 'Term updated successfully' : 'Term added successfully'), 'Success');
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(this.formService.extractError(err, 'Failed to save term'), 'Error');
        this.loading = false;
      }
    });
  }
}
