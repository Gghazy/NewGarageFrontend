import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ClientDto } from 'src/app/shared/Models/clients/client-dto';
import { ClientForm } from 'src/app/features/management-clients/clients/client-form/client-form';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-booking-form',
  standalone: false,
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.css',
})
export class BookingForm implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  bookingId?: string;
  submitted = false;
  saving = false;

  // Client typeahead
  clientSearch$ = new Subject<string>();
  clients: ClientDto[] = [];
  clientsLoading = false;
  selectedClientId: string | null = null;
  private pendingSelectName: string | null = null;

  clientCollapsed = false;
  detailsCollapsed = false;

  branches: any[] = [];
  manufacturers: any[] = [];
  carMarks: any[] = [];

  transmissionTypes = [
    { value: 'Automatic', labelAr: 'أوتوماتيك', labelEn: 'Automatic' },
    { value: 'Manual', labelAr: 'يدوي', labelEn: 'Manual' },
    { value: 'CVT', labelAr: 'CVT', labelEn: 'CVT' },
    { value: 'SemiAutomatic', labelAr: 'نصف أوتوماتيك', labelEn: 'Semi-Automatic' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    this.buildForm();
    this.setupClientSearch();
    this.loadBranches();
    this.loadManufacturers();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.bookingId = id;
      this.loadBooking(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      clientId: [null, Validators.required],
      branchId: [null, Validators.required],
      manufacturerId: [null, Validators.required],
      carMarkId: [null, Validators.required],
      year: [null],
      transmission: [null],
      examinationDate: [null, Validators.required],
      examinationTime: [null, Validators.required],
      notes: [null],
    });

    this.form.get('manufacturerId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(manufacturerId => {
        this.form.get('carMarkId')!.setValue(null);
        this.loadCarMarks(manufacturerId);
      });
  }

  private setupClientSearch(): void {
    this.clientSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      tap(() => (this.clientsLoading = true)),
      switchMap(term =>
        this.api.post<any>('Clients/pagination', {
          currentPage: 1, itemsPerPage: 20, textSearch: term ?? '',
          sort: 'nameAr', desc: false,
        }).pipe(catchError(() => of({ data: { items: [] } })))
      ),
    ).subscribe(res => {
      this.clients = res?.data?.items ?? [];
      this.clientsLoading = false;

      if (this.pendingSelectName && this.clients.length > 0) {
        const name = this.pendingSelectName;
        this.pendingSelectName = null;
        const found = this.clients.find(c => c.nameAr === name) ?? this.clients[0];
        this.onClientSelected(found);
      }
    });
  }

  onClientSelected(client: ClientDto | null): void {
    this.selectedClientId = client?.id ?? null;
    this.form.get('clientId')!.setValue(client?.id ?? null);
  }

  openAddClientModal(): void {
    const ref = this.modal.open(ClientForm, { centered: true, backdrop: 'static', size: 'lg' });
    ref.componentInstance.title = this.translate.instant('CLIENTS.FORM.TITLE_ADD');

    ref.result.then((result: { nameAr: string } | undefined) => {
      if (result?.nameAr) {
        this.pendingSelectName = result.nameAr;
        this.clientSearch$.next(result.nameAr);
      }
    }).catch(() => {});
  }

  private loadBranches(): void {
    this.api.get<any>('Branches')
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => { this.branches = res.data ?? []; } });
  }

  private loadManufacturers(): void {
    this.api.get<any>('Manufacturers')
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => { this.manufacturers = res.data ?? []; } });
  }

  private loadCarMarks(manufacturerId: string | null): void {
    if (!manufacturerId) {
      this.carMarks = [];
      return;
    }
    this.api.get<any>(`CarMarkes/by-manufacturer/${manufacturerId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => { this.carMarks = res.data ?? []; } });
  }

  private loadBooking(id: string): void {
    this.bookingService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const b = res.data;
          // Load existing client into typeahead
          this.api.post<any>('Clients/pagination', {
            currentPage: 1, itemsPerPage: 20,
            textSearch: b.clientNameAr ?? '',
            sort: 'nameAr', desc: false,
          }).pipe(
            takeUntil(this.destroy$),
            catchError(() => of({ data: { items: [] } })),
          ).subscribe(clientRes => {
            this.clients = clientRes?.data?.items ?? [];
            const found = this.clients.find(c => c.id === b.clientId);
            if (found) {
              this.selectedClientId = found.id!;
            }
          });

          // Load car marks for the manufacturer
          this.loadCarMarks(b.manufacturerId);

          setTimeout(() => {
            this.form.patchValue({
              clientId: b.clientId,
              branchId: b.branchId,
              manufacturerId: b.manufacturerId,
              carMarkId: b.carMarkId,
              year: b.year,
              transmission: b.transmission,
              examinationDate: b.examinationDate,
              examinationTime: b.examinationTime,
              notes: b.notes,
            });
          }, 300);
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.goBack();
        },
      });
  }

  save(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    if (this.saving) return;

    this.saving = true;
    const payload = this.form.getRawValue();

    const obs = this.isEdit
      ? this.bookingService.update(this.bookingId!, payload)
      : this.bookingService.create(payload);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false;
        const key = this.isEdit ? 'BOOKINGS.UPDATED_SUCCESS' : 'BOOKINGS.CREATED_SUCCESS';
        this.toastr.success(this.translate.instant(key));
        this.goBack();
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/features/bookings']);
  }
}
