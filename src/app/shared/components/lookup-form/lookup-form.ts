import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { LookupDto } from '../../Models/lookup-dto';
import { LookupConfig } from '../../Models/lookup-config';
import { ApiService } from 'src/app/core/services/custom.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiMessage } from '../../Models/api-response';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-lookup-form',
  standalone: false,
  templateUrl: './lookup-form.html',
  styleUrl: './lookup-form.css',
})
export class LookupForm implements OnInit, OnDestroy {
  @Input() title = 'Add';
  @Input({ required: true }) config!: LookupConfig;
  @Input() initial?: Partial<LookupDto>;

  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [''],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.initial) {
      this.form.patchValue({
        id: this.initial.id ?? '',
        nameAr: this.initial.nameAr ?? '',
        nameEn: this.initial.nameEn ?? '',
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const value: LookupDto = {
      id: this.form.value.id!,
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
    };

    if (value.id) this.update(value);
    else this.add(value);
  }

  add(request: LookupDto) {
    this.apiService.post<ApiMessage>(`${this.config.apiBase}`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Created successfully', 'Success');
          this.activeModal.close(request);
        },
        error: (err) => {
          console.error('[LookupForm] Failed to create:', err);
          this.toastr.error(err?.error?.message ?? 'Failed to create', 'Error');
          this.loading = false;
        }
      });
  }

  update(request: LookupDto) {
    this.apiService.put<ApiMessage>(`${this.config.apiBase}/${request.id}`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.toastr.success(res?.message ?? 'Updated successfully', 'Success');
          this.activeModal.close(request);
        },
        error: (err) => {
          console.error('[LookupForm] Failed to update:', err);
          this.toastr.error(err?.error?.message ?? 'Failed to update', 'Error');
          this.loading = false;
        }
      });
  }
}
