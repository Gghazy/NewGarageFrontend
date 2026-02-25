import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ExaminationItemRequest } from 'src/app/shared/Models/vehicle-orders/vehicle-order-request';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';

export interface ServiceDto {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface ServicePriceDto {
  serviceId: string;
  price: number;
}

@Component({
  selector: 'app-services-section',
  standalone: false,
  templateUrl: './services-section.html',
  styleUrl: './services-section.css',
})
export class ServicesSection implements OnInit, OnChanges, OnDestroy {
  @Input() examination?: ExaminationDto;
  @Input() carMarkId?: string;
  @Input() year?: number;
  @Output() servicesChange = new EventEmitter<ExaminationItemRequest[]>();

  collapsed = false;
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  services: ServiceDto[] = [];
  private priceMap = new Map<string, number>();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadServices();

    if (this.examination) {
      this.patchFormWithExamination();
    } else {
      this.addLine();
    }

    if (this.carMarkId) {
      this.loadServicePrices();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['carMarkId'] || changes['year']) && !changes['carMarkId']?.firstChange) {
      this.loadServicePrices();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private patchFormWithExamination(): void {
    const items = this.examination!.items ?? [];

    if (items.length === 0) {
      this.addLine();
      return;
    }

    for (const item of items) {
      this.lines.push(this.fb.group({
        serviceId:     [item.serviceId],
        overridePrice: [item.price || null],
      }));
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      lines: this.fb.array([]),
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.emitChange());
  }

  private loadServices(): void {
    this.api.post<any>('Services/pagination', {
      currentPage: 1, itemsPerPage: 200, textSearch: '', sort: 'nameAr', desc: false,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => (this.services = res?.data?.items ?? []) });
  }

  loadServicePrices(): void {
    if (!this.carMarkId) {
      this.priceMap.clear();
      return;
    }

    this.api.post<any>('ServicePrices/pagination', {
      search: { currentPage: 1, itemsPerPage: 500, textSearch: '' },
      markId: this.carMarkId,
      year: this.year || null,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.priceMap.clear();
          const items: ServicePriceDto[] = res?.data?.items ?? [];
          for (const sp of items) {
            this.priceMap.set(sp.serviceId, sp.price);
          }
        },
      });
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  addLine(): void {
    this.lines.push(this.fb.group({
      serviceId:     [null],
      overridePrice: [null],
    }));
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  getServicePrice(serviceId: string | null): number {
    if (!serviceId) return 0;
    return this.priceMap.get(serviceId) ?? 0;
  }

  getLinePrice(ctrl: any): number {
    const override = ctrl.value.overridePrice;
    if (override != null && override !== '') return Number(override) || 0;
    return this.getServicePrice(ctrl.value.serviceId);
  }

  get totalPrice(): number {
    return this.lines.controls.reduce((sum, ctrl) => sum + this.getLinePrice(ctrl), 0);
  }

  private emitChange(): void {
    const items: ExaminationItemRequest[] = this.lines.controls
      .map(c => c.value)
      .filter(v => v.serviceId)
      .map(v => ({ serviceId: v.serviceId, overridePrice: v.overridePrice ?? undefined }));

    this.servicesChange.emit(items);
  }
}
