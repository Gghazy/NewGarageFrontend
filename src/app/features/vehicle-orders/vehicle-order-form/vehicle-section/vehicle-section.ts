import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';
import {
  SAUDI_PLATE_LETTERS,
  TRANSMISSION_OPTIONS,
  EXAMINATION_TYPES,
  VehicleFormData,
} from 'src/app/shared/constants/vehicle-constants';

@Component({
  selector: 'app-vehicle-section',
  standalone: false,
  templateUrl: './vehicle-section.html',
  styleUrl: './vehicle-section.css',
})
export class VehicleSection implements OnInit, OnDestroy {
  @Input() examination?: ExaminationDto;
  @Input() submitted = false;
  @Output() vehicleChange = new EventEmitter<VehicleFormData>();

  collapsed = false;
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  branches: LookupDto[]      = [];
  manufacturers: LookupDto[] = [];
  carMarks: LookupDto[]      = [];

  readonly plateLetters    = SAUDI_PLATE_LETTERS;
  readonly transmissions   = TRANSMISSION_OPTIONS;
  readonly examinationTypes = EXAMINATION_TYPES;
  readonly mileageUnits    = ['Km', 'Mile'];

  // plate letters as separate controls joined on emit
  plateL1: string | null = null;
  plateL2: string | null = null;
  plateL3: string | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBranches();
    this.loadManufacturers();
    this.loadCarMarks();

    if (this.examination) {
      this.patchFormWithExamination();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private guidOrNull(val: string | undefined): string | null {
    if (!val || val === '00000000-0000-0000-0000-000000000000') return null;
    return val;
  }

  private patchFormWithExamination(): void {
    const e = this.examination!;

    this.form.patchValue({
      branchId:       this.guidOrNull(e.branchId),
      manufacturerId: this.guidOrNull(e.manufacturerId),
      carMarkId:      this.guidOrNull(e.carMarkId),
      type:           e.type || 'Regular',
      hasPlate:       e.hasPlate,
      plateNumbers:   e.plateNumbers || '',
      mileage:        e.mileage ?? null,
      mileageUnit:    e.mileageUnit || 'Km',
      year:           e.year ?? null,
      color:          e.color || '',
      transmission:   e.transmission || null,
      vin:            e.vin || '',
      marketerCode:   e.marketerCode || '',
      hasWarranty:    e.hasWarranty,
      notes:          e.notes || '',
    });

    // Split plate letters into individual chars
    const letters = e.plateLetters || '';
    const chars = [...letters];
    this.plateL1 = chars[0] || null;
    this.plateL2 = chars[1] || null;
    this.plateL3 = chars[2] || null;

    // Sync plate enabled/disabled based on loaded hasPlate value
    this.syncPlateState(e.hasPlate);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      branchId:       [null],
      manufacturerId: [null],
      carMarkId:      [null],
      type:           ['Regular'],
      hasPlate:       [true],
      plateNumbers:   [''],
      mileage:        [null],
      mileageUnit:    ['Km'],
      year:           [null],
      color:          [''],
      transmission:   [null],
      vin:            [''],
      marketerCode:   [''],
      hasWarranty:    [true],
      notes:          [''],
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(() => this.emitChange(this.form.getRawValue()));

    // Sync plate enabled/disabled when hasPlate changes
    this.form.get('hasPlate')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasPlate => {
        this.syncPlateState(hasPlate);
      });
  }

  private syncPlateState(hasPlate: boolean): void {
    const plateNumbers = this.form.get('plateNumbers')!;
    if (!hasPlate) {
      this.plateL1 = null;
      this.plateL2 = null;
      this.plateL3 = null;
      plateNumbers.setValue('');
      plateNumbers.disable({ emitEvent: false });
    } else {
      plateNumbers.enable({ emitEvent: false });
    }
    this.emitChange(this.form.getRawValue());
  }

  private loadBranches(): void {
    this.api.post<any>('Branches/pagination', { currentPage: 1, itemsPerPage: 100, textSearch: '', sort: 'nameAr', desc: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => (this.branches = res?.data?.items ?? []) });
  }

  private loadManufacturers(): void {
    this.api.post<any>('Manufacturers/pagination', { currentPage: 1, itemsPerPage: 200, textSearch: '', sort: 'nameAr', desc: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => (this.manufacturers = res?.data?.items ?? []) });
  }

  private loadCarMarks(): void {
    this.api.post<any>('CarMarkes/pagination', { currentPage: 1, itemsPerPage: 200, textSearch: '', sort: 'nameAr', desc: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => (this.carMarks = res?.data?.items ?? []) });
  }

  onPlateLetterChange(): void {
    this.emitChange(this.form.getRawValue());
  }

  private buildPlateLetters(): string {
    return [this.plateL1, this.plateL2, this.plateL3].filter(Boolean).join('');
  }

  private emitChange(val: any): void {
    this.vehicleChange.emit({ ...val, plateLetters: this.buildPlateLetters() });
  }
}
