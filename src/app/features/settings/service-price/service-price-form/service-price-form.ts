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
import { ServiceDto } from 'src/app/shared/Models/service/service-dto';
import { ServicePriceDto } from 'src/app/shared/Models/servicePrice/service-price-dto';
import { ServicePriceRequest } from 'src/app/shared/Models/servicePrice/service-price-request';

@Component({
  selector: 'app-service-price-form',
  standalone: false,
  templateUrl: './service-price-form.html',
  styleUrl: './service-price-form.css',
})
export class ServicePriceForm implements OnInit, OnDestroy {
  @Input() title = 'Add Service Price';
  @Input() service?: ServicePriceDto;
  @Input() serviceId?: string;

  services: ServiceDto[] = [];
  marks: LookupDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    markId: ['', [Validators.required]],
    serviceId: ['', [Validators.required]],
    fromYear: this.fb.control<number | null>(null, [Validators.required, Validators.min(1900)]),
    toYear: this.fb.control<number | null>(null, [Validators.required, Validators.min(1900)]),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    if (this.service) {
      this.form.patchValue({
        markId: this.service.markId,
        serviceId: this.service.serviceId,
        fromYear: this.service.fromYear,
        toYear: this.service.toYear,
        price: this.service.price
      });
    }
    this.getServices();
    this.getMarks();
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
    // ServicesController GetAll uses Success() -> { data: [...] }
    this.apiService.get<ApiResponse<ServiceDto[]>>('services')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.services = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load services'), 'Error'); }
      });
  }

  getMarks() {
    // CarMarkesController GetAll uses Success() -> { data: [...] }
    this.apiService.get<ApiResponse<LookupDto[]>>('CarMarkes')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.marks = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load marks'), 'Error'); }
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: ServicePriceRequest = {
      id: this.serviceId,
      markId: this.form.value.markId!,
      serviceId: this.form.value.serviceId!,
      fromYear: this.form.value.fromYear!,
      toYear: this.form.value.toYear!,
      price: this.form.value.price!,
    };

    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`ServicePrices/${value.id}`, value)
      : this.apiService.post('ServicePrices', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Service price updated successfully' : 'Service price created successfully',
      errorFallback: isEdit ? 'Failed to update service price' : 'Failed to create service price',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
