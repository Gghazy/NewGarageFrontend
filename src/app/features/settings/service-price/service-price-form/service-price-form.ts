import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';
import { ServiceDto } from 'src/app/shared/Models/service/service-dto';
import { ServicePriceDto } from 'src/app/shared/Models/servicePrice/service-price-dto';
import { ServicePriceRequest } from 'src/app/shared/Models/servicePrice/service-price-request';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-service-price-form',
  standalone: false,
  templateUrl: './service-price-form.html',
  styleUrl: './service-price-form.css',
})
export class ServicePriceForm implements OnInit, OnDestroy {
  @Input() title = 'Add Service';
  @Input() service?: ServicePriceDto;
  @Input() serviceId?: string; // Track ID separately

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
    public apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService
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
  getServices() {
    this.apiService.get<ServiceDto[]>('services')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.services = data;
        },
        error: (err) => {
          console.error('[ServicePriceForm] Failed to load services:', err);
          this.toastr.error('Failed to load services', 'Error');
        }
      });
  }

  getMarks() {
    this.apiService.get<LookupDto[]>('CarMarkes')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.marks = data;
        },
        error: (err) => {
          console.error('[ServicePriceForm] Failed to load marks:', err);
          this.toastr.error('Failed to load marks', 'Error');
        }
      });
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

    const value: ServicePriceRequest = {
      id: this.serviceId,
      markId: this.form.value.markId!,
      serviceId: this.form.value.serviceId!,
      fromYear: this.form.value.fromYear!,
      toYear: this.form.value.toYear!,
      price: this.form.value.price!,
    };

    if (value.id) {
      this.update(value);
    } else {
      this.add(value);
    }
  }

  add(request: ServicePriceRequest) {
    this.apiService.post('ServicePrices', request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Service price created successfully', 'Success');
          this.activeModal.close(request);
        },
        error: (err) => {
          console.error('[ServicePriceForm] Failed to create:', err);
          this.toastr.error(err?.error?.message ?? 'Failed to create service price', 'Error');
          this.loading = false;
        }
      });
  }

  update(request: ServicePriceRequest) {
    this.apiService.put(`ServicePrices/${request.id}`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.toastr.success(res.message ?? 'Service price updated successfully', 'Success');
          this.activeModal.close(request);
        },
        error: (err) => {
          console.error('[ServicePriceForm] Failed to update:', err);
          this.toastr.error(err?.error?.message ?? 'Failed to update service price', 'Error');
          this.loading = false;
        }
      });
  }
}
