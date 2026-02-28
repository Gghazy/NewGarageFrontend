import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { ExaminationItemRequest } from 'src/app/shared/Models/vehicle-orders/vehicle-order-request';
import { buildCreatePayload, buildUpdatePayload, ExaminationPayloadInput } from './examination-payload-builder';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';
import { ClientFormData, ClientFormOutput, VehicleFormData } from 'src/app/shared/constants/vehicle-constants';

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
  generatingInvoice = false;
  startAfterSave = false;
  submitted = false;
  draftSubmitted = false;
  examinationId?: string;
  examination?: ExaminationDto;

  private destroy$ = new Subject<void>();
  private clientData: ClientFormOutput = { type: 'Company', data: {} as ClientFormData };
  vehicleData: VehicleFormData = {} as VehicleFormData;
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
          if (this.examination && !['Draft', 'Pending', 'InProgress'].includes(this.examination.status)) {
            this.toastr.error(this.translate.instant('VEHICLE_ORDERS.FORM.NOT_EDITABLE'));
            this.router.navigate(['/features/vehicle-orders', this.examinationId, 'details']);
            return;
          }
          this.loading = false;
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.router.navigate(['/features/vehicle-orders']);
        },
      });
  }

  onClientChange(event: ClientFormOutput): void {
    this.clientData = event;
  }

  onVehicleChange(event: VehicleFormData): void {
    this.vehicleData = event;
  }

  onServicesChange(items: ExaminationItemRequest[]): void {
    this.serviceItems = items;
  }

  save(start: boolean): void {
    if (this.saving) return;
    this.startAfterSave = start;

    this.draftSubmitted = true;
    this.submitted = start;
    const errors = this.validate(start);
    if (errors.length > 0) {
      this.toastr.error(errors[0]);
      return;
    }

    this.saving = true;

    if (this.isEdit) {
      this.update();
    } else {
      this.create();
    }
  }

  private validate(full: boolean): string[] {
    const errors: string[] = [];

    // Always required (draft + normal save)
    if (!this.clientData.id) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.CLIENT_REQUIRED'));
    }

    if (!full) return errors;

    // Only required on normal save
    if (!this.vehicleData.branchId) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.BRANCH_REQUIRED'));
    }
    if (!this.vehicleData.manufacturerId) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.MANUFACTURER_REQUIRED'));
    }
    if (!this.vehicleData.carMarkId) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.CAR_MARK_REQUIRED'));
    }
    if (!this.vehicleData.year) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.YEAR_REQUIRED'));
    }
    if (!this.vehicleData.color) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.COLOR_REQUIRED'));
    }
    if (!this.vehicleData.transmission) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.TRANSMISSION_REQUIRED'));
    }
    if (this.vehicleData.mileage == null) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.MILEAGE_REQUIRED'));
    }
    if (this.vehicleData.hasPlate !== false) {
      // Plate required when hasPlate is true
      if (!this.vehicleData.plateLetters) {
        errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.PLATE_LETTERS_REQUIRED'));
      }
      if (!this.vehicleData.plateNumbers) {
        errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.PLATE_NUMBERS_REQUIRED'));
      }
    } else {
      // VIN required when hasPlate is false
      if (!this.vehicleData.vin) {
        errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.VIN_REQUIRED'));
      }
    }
    if (!this.serviceItems || this.serviceItems.length === 0) {
      errors.push(this.translate.instant('VEHICLE_ORDERS.VALIDATION.SERVICES_REQUIRED'));
    }
    return errors;
  }

  private get payloadInput(): ExaminationPayloadInput {
    return {
      clientId:       this.clientData.id,
      clientType:     this.clientData.type,
      clientData:     this.clientData.data,
      vehicleData:    this.vehicleData,
      serviceItems:   this.serviceItems,
      startAfterSave: this.startAfterSave,
    };
  }

  private create(): void {
    this.api.post<any>('Examinations', buildCreatePayload(this.payloadInput)).subscribe({
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

  private update(): void {
    this.api.put<any>(`Examinations/${this.examinationId}`, buildUpdatePayload(this.payloadInput)).subscribe({
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

  generateInvoice(): void {
    if (this.generatingInvoice || !this.examinationId) return;
    this.generatingInvoice = true;

    this.api.post<any>(`Invoices/from-examination/${this.examinationId}`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.generatingInvoice = false;
          this.toastr.success(this.translate.instant('VEHICLE_ORDERS.FORM.INVOICE_GENERATED'));
          const invoiceId = res?.data;
          if (invoiceId) {
            this.router.navigate(['/features/invoices', invoiceId]);
          }
        },
        error: (err) => {
          this.generatingInvoice = false;
          this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/features/vehicle-orders']);
  }
}
