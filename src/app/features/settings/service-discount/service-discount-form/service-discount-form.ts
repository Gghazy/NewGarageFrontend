import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { ServiceDto } from 'src/app/shared/Models/service/service-dto';
import { ServiceDiscountDto } from 'src/app/shared/Models/serviceDiscount/service-discount-dto';
import { ServiceDiscountRequest } from 'src/app/shared/Models/serviceDiscount/service-discount-request';

@Component({
  selector: 'app-service-discount-form',
  standalone: false,
  templateUrl: './service-discount-form.html',
  styleUrl: './service-discount-form.css',
})
export class ServiceDiscountForm implements OnInit, OnDestroy {
  @Input() title = 'Add Service Discount';
  @Input() discount?: ServiceDiscountDto;
  @Input() discountId?: string;

  services: ServiceDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    serviceId: ['', [Validators.required]],
    discountPercent: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01), Validators.max(100)]),
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    isActive: [true],
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    if (this.discount) {
      this.form.patchValue({
        serviceId: this.discount.serviceId,
        discountPercent: this.discount.discountPercent,
        startDate: this.discount.startDate ? this.discount.startDate.substring(0, 10) : '',
        endDate: this.discount.endDate ? this.discount.endDate.substring(0, 10) : '',
        isActive: this.discount.isActive,
      });
    }
    this.getServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  getServices() {
    this.apiService.get<ApiResponse<ServiceDto[]>>('services')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.services = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load services'), 'Error'); }
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: ServiceDiscountRequest = {
      id: this.discountId,
      serviceId: this.form.value.serviceId!,
      discountPercent: this.form.value.discountPercent!,
      startDate: this.form.value.startDate!,
      endDate: this.form.value.endDate!,
      isActive: this.form.value.isActive!,
    };

    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`ServiceDiscounts/${value.id}`, value)
      : this.apiService.post('ServiceDiscounts', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Service discount updated successfully' : 'Service discount created successfully',
      errorFallback: isEdit ? 'Failed to update service discount' : 'Failed to create service discount',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
