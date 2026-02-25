import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { CreateExaminationRequest, ExaminationItemRequest, UpdateExaminationRequest } from 'src/app/shared/Models/vehicle-orders/vehicle-order-request';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';

@Component({
  selector: 'app-vehicle-order-form',
  standalone: false,
  templateUrl: './vehicle-order-form.html',
  styleUrl: './vehicle-order-form.css',
})
export class VehicleOrderForm implements OnInit, OnDestroy {
  saving = false;
  loading = false;
  isEdit = false;
  examinationId?: string;
  examination?: ExaminationDto;

  private destroy$ = new Subject<void>();
  private clientData: { id?: string; type: string; data: any } = { type: 'Company', data: {} };
  vehicleData: any = {};
  private serviceItems: ExaminationItemRequest[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.examinationId = params.get('id') ?? undefined;
        this.isEdit = !!this.examinationId;
        if (this.isEdit) {
          this.loadExamination();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExamination(): void {
    this.loading = true;
    this.api.get<any>(`Examinations/${this.examinationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.examination = res.data;
          this.loading = false;
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.router.navigate(['/features/vehicle-orders']);
        },
      });
  }

  onClientChange(event: { id?: string; type: string; data: any }): void {
    this.clientData = event;
  }

  onVehicleChange(event: any): void {
    this.vehicleData = event;
  }

  onServicesChange(items: ExaminationItemRequest[]): void {
    this.serviceItems = items;
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;

    const d = this.clientData.data;
    const v = this.vehicleData;

    if (this.isEdit) {
      this.update(d, v);
    } else {
      this.create(d, v);
    }
  }

  private create(d: any, v: any): void {
    const payload: CreateExaminationRequest = {
      // Client
      clientId:             this.clientData.id,
      clientType:           this.clientData.type,
      clientNameAr:         d.clientNameAr ?? '',
      clientNameEn:         d.clientNameEn ?? '',
      clientPhone:          d.clientPhone ?? '',
      clientEmail:          d.email || undefined,
      clientResourceId:     d.clientResourceId || undefined,
      individualAddress:    d.individualAddress || undefined,
      commercialRegister:   d.commercialRegister || undefined,
      taxNumber:            d.taxNumber || undefined,
      streetName:           d.streetName || undefined,
      additionalStreetName: d.additionalStreetName || undefined,
      cityName:             d.cityName || undefined,
      postalZone:           d.postalZone || undefined,
      countrySubentity:     d.countrySubentity || undefined,
      countryCode:          d.countryCode || undefined,
      buildingNumber:       d.buildingNumber || undefined,
      citySubdivisionName:  d.citySubdivisionName || undefined,

      // Branch + meta
      branchId:     v.branchId ?? '',
      type:         v.type ?? 'Regular',
      hasWarranty:  v.hasWarranty ?? true,
      hasPhotos:    v.hasPhotos ?? true,
      marketerCode: v.marketerCode || undefined,
      notes:        v.notes || undefined,

      // Vehicle
      manufacturerId: v.manufacturerId ?? '',
      carMarkId:      v.carMarkId ?? '',
      year:           v.year || undefined,
      color:          v.color || undefined,
      vin:            v.vin || undefined,
      hasPlate:       v.hasPlate ?? true,
      plateLetters:   v.plateLetters || undefined,
      plateNumbers:   v.plateNumbers || undefined,
      mileage:        v.mileage || undefined,
      mileageUnit:    v.mileageUnit ?? 'Km',
      transmission:   v.transmission || undefined,

      // Services
      items: this.serviceItems,
    };

    this.api.post<any>('Examinations', payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('VEHICLE_ORDERS.FORM.SAVED'));
        this.router.navigate(['/features/vehicle-orders']);
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
      },
    });
  }

  private update(d: any, v: any): void {
    const payload: UpdateExaminationRequest = {
      // Client
      clientType:           this.clientData.type,
      clientNameAr:         d.clientNameAr ?? '',
      clientNameEn:         d.clientNameEn ?? '',
      clientPhone:          d.clientPhone ?? '',
      clientEmail:          d.email || undefined,
      clientResourceId:     d.clientResourceId || undefined,
      individualAddress:    d.individualAddress || undefined,
      commercialRegister:   d.commercialRegister || undefined,
      taxNumber:            d.taxNumber || undefined,
      streetName:           d.streetName || undefined,
      additionalStreetName: d.additionalStreetName || undefined,
      cityName:             d.cityName || undefined,
      postalZone:           d.postalZone || undefined,
      countrySubentity:     d.countrySubentity || undefined,
      countryCode:          d.countryCode || undefined,
      buildingNumber:       d.buildingNumber || undefined,
      citySubdivisionName:  d.citySubdivisionName || undefined,

      // Examination meta
      hasWarranty:  v.hasWarranty ?? true,
      hasPhotos:    v.hasPhotos ?? true,
      marketerCode: v.marketerCode || undefined,
      notes:        v.notes || undefined,

      // Vehicle
      manufacturerId: v.manufacturerId ?? '',
      carMarkId:      v.carMarkId ?? '',
      year:           v.year || undefined,
      color:          v.color || undefined,
      vin:            v.vin || undefined,
      hasPlate:       v.hasPlate ?? true,
      plateLetters:   v.plateLetters || undefined,
      plateNumbers:   v.plateNumbers || undefined,
      mileage:        v.mileage || undefined,
      mileageUnit:    v.mileageUnit ?? 'Km',
      transmission:   v.transmission || undefined,

      // Services
      items: this.serviceItems,
    };

    this.api.put<any>(`Examinations/${this.examinationId}`, payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('VEHICLE_ORDERS.FORM.SAVED'));
        this.router.navigate(['/features/vehicle-orders']);
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/features/vehicle-orders']);
  }
}
