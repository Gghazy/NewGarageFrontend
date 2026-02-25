import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ExaminationItemRequest } from 'src/app/shared/Models/vehicle-orders/vehicle-order-request';

export interface ServiceDto {
  id: string;
  nameAr: string;
  nameEn: string;
  price?: number;
}

@Component({
  selector: 'app-services-section',
  standalone: false,
  templateUrl: './services-section.html',
  styleUrl: './services-section.css',
})
export class ServicesSection implements OnInit, OnDestroy {
  @Output() servicesChange = new EventEmitter<ExaminationItemRequest[]>();

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  services: ServiceDto[] = [];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadServices();
    this.addLine();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  get totalPrice(): number {
    return this.lines.controls.reduce((sum, ctrl) => {
      return sum + (Number(ctrl.value.overridePrice) || 0);
    }, 0);
  }

  private emitChange(): void {
    const items: ExaminationItemRequest[] = this.lines.controls
      .map(c => c.value)
      .filter(v => v.serviceId)
      .map(v => ({ serviceId: v.serviceId, overridePrice: v.overridePrice ?? undefined }));

    this.servicesChange.emit(items);
  }
}
