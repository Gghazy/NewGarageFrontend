import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';
import { CarMarkDto } from 'src/app/shared/Models/car-mark/car-mark-dto';

@Component({
  selector: 'app-car-mark-form',
  standalone: false,
  templateUrl: './car-mark-form.html',
  styleUrl: './car-mark-form.css',
})
export class CarMarkForm implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() carMark?: CarMarkDto;
  @Input() carMarkId?: string;

  manufacturers: LookupDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    manufacturerId: ['', [Validators.required]],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private formService: FormService
  ) {}

  ngOnInit(): void {
    this.loadManufacturers();
    if (this.carMark) {
      this.form.patchValue({
        manufacturerId: this.carMark.manufacturerId ?? '',
        nameAr: this.carMark.nameAr ?? '',
        nameEn: this.carMark.nameEn ?? '',
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadManufacturers(): void {
    this.apiService.get<ApiResponse<LookupDto[]>>('Manufacturers')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.manufacturers = res.data; },
        error: (err) => {
          this.toastr.error(this.formService.extractError(err, 'Failed to load manufacturers'), 'Error');
        }
      });
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      manufacturerId: this.form.value.manufacturerId!,
    };

    const isEdit = !!this.carMarkId;
    const apiCall = isEdit
      ? this.apiService.put(`CarMarkes/${this.carMarkId}`, value)
      : this.apiService.post('CarMarkes', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Car mark updated successfully' : 'Car mark created successfully',
      errorFallback: isEdit ? 'Failed to update car mark' : 'Failed to create car mark',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
