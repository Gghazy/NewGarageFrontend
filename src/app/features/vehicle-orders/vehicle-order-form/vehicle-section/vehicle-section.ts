import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';

export const SAUDI_PLATE_LETTERS = [
  'أ','ب','ت','ث','ج','ح','خ','د','ذ','ر',
  'ز','س','ش','ص','ط','ع','غ','ف','ق','ك',
  'ل','م','ن','هـ','و','ي'
];

export const TRANSMISSION_OPTIONS = [
  { value: 'Automatic',     labelAr: 'أوتوماتيك',      labelEn: 'Automatic' },
  { value: 'Manual',        labelAr: 'يدوي',            labelEn: 'Manual' },
  { value: 'SemiAutomatic', labelAr: 'نصف أوتوماتيك',  labelEn: 'Semi-Automatic' },
  { value: 'CVT',           labelAr: 'CVT',             labelEn: 'CVT' },
];

export const EXAMINATION_TYPES = [
  { value: 'Regular',     labelAr: 'فحص عادي',        labelEn: 'Regular' },
  { value: 'Warranty',    labelAr: 'فحص ضمان',        labelEn: 'Warranty' },
  { value: 'PrePurchase', labelAr: 'فحص ما قبل الشراء', labelEn: 'Pre-Purchase' },
];

@Component({
  selector: 'app-vehicle-section',
  standalone: false,
  templateUrl: './vehicle-section.html',
  styleUrl: './vehicle-section.css',
})
export class VehicleSection implements OnInit, OnDestroy {
  @Output() vehicleChange = new EventEmitter<any>();

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      hasPhotos:      [true],
      notes:          [''],
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(val => this.emitChange(val));
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
    this.emitChange(this.form.value);
  }

  private buildPlateLetters(): string {
    return [this.plateL1, this.plateL2, this.plateL3].filter(Boolean).join('');
  }

  private emitChange(val: any): void {
    this.vehicleChange.emit({ ...val, plateLetters: this.buildPlateLetters() });
  }
}
