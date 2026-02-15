import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
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
export class ServicePriceForm {
  @Input() title = 'Add Service';
  @Input() service?: ServicePriceDto;

  services: ServiceDto[] = [];
  marks: LookupDto[] = [];

  loading = false;

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
    this.apiService.get<ServiceDto[]>('services').subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (err) => {
        console.error('Error loading services', err);
      }
    });
  }
  getMarks() {
    this.apiService.get<LookupDto[]>('CarMarkes').subscribe({
      next: (data) => {
        this.marks = data;
      },
      error: (err) => {
        console.error('Error loading marks', err);
      }
    });
  }


  submit() {
    debugger
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const value: ServicePriceRequest = {
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
    this.apiService.post('ServicePrices', request).subscribe(() => {
      this.activeModal.close(request);
    });
  }
  update(request: ServicePriceRequest) {
    this.apiService.put(`ServicePrices/${request.id}`, request).subscribe((res: any) => {

      this.toastr.success(res.message as string, 'Success');
      this.activeModal.close(request);
    });
  }
}
