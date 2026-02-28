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
export class ServicesSection implements OnInit, OnDestroy, OnChanges {
  @Input() examination?: ExaminationDto;
  @Input() submitted = false;
  @Input() carMarkId?: string;
  @Input() year?: number;
  @Output() servicesChange = new EventEmitter<ExaminationItemRequest[]>();

  collapsed = false;
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  services: ServiceDto[] = [];
  priceMap: Record<string, number> = {};

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
        serviceId: [item.serviceId],
        quantity:  [item.quantity || 1],
        price:     [item.overridePrice ?? 0],
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
    this.api.get<any>('Services')
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => (this.services = res?.data ?? []) });
  }

  private loadServicePrices(): void {
    if (!this.carMarkId) {
      this.priceMap = {};
      return;
    }

    this.api.post<any>('servicePrices/pagination', {
      search: { currentPage: 1, itemsPerPage: 500, textSearch: '', sort: 'serviceId', desc: false },
      markId: this.carMarkId,
      year: this.year || null,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items: ServicePriceDto[] = res?.data?.items ?? [];
          this.priceMap = {};
          for (const sp of items) {
            this.priceMap[sp.serviceId] = sp.price;
          }
          this.autoFillPrices();
        },
      });
  }

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  addLine(): void {
    this.lines.push(this.fb.group({
      serviceId: [null],
      quantity:  [1],
      price:     [0],
    }));
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
  }

  onServiceChange(index: number): void {
    const line = this.lines.at(index);
    const serviceId = line.get('serviceId')?.value;
    const price = this.getServicePrice(serviceId);
    line.get('price')?.setValue(price);
  }

  private autoFillPrices(): void {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines.at(i);
      const serviceId = line.get('serviceId')?.value;
      const currentPrice = line.get('price')?.value || 0;
      if (serviceId && currentPrice === 0) {
        const price = this.getServicePrice(serviceId);
        line.get('price')?.setValue(price);
      }
    }
  }

  get hasValidServices(): boolean {
    return this.lines.controls.some(c => !!c.value.serviceId);
  }

  getServicePrice(serviceId: string | null): number {
    if (!serviceId) return 0;
    return this.priceMap[serviceId] ?? 0;
  }

  get totalPrice(): number {
    return this.lines.controls.reduce((sum, line) => {
      const price = line.get('price')?.value || 0;
      return sum + price;
    }, 0);
  }

  get taxAmount(): number {
    return this.totalPrice * 0.15;
  }

  get totalWithTax(): number {
    return this.totalPrice + this.taxAmount;
  }

  private emitChange(): void {
    const items: ExaminationItemRequest[] = this.lines.controls
      .map(c => c.value)
      .filter(v => v.serviceId)
      .map(v => ({
        serviceId: v.serviceId,
        quantity: v.quantity || 1,
        overridePrice: v.price > 0 ? v.price : undefined,
      }));

    this.servicesChange.emit(items);
  }
}
