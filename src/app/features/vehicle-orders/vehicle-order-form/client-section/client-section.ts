import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ClientDto } from 'src/app/shared/Models/clients/client-dto';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';

@Component({
  selector: 'app-client-section',
  standalone: false,
  templateUrl: './client-section.html',
  styleUrl: './client-section.css',
})
export class ClientSection implements OnInit, OnDestroy {
  @Output() clientChange = new EventEmitter<{ id?: string; type: string; data: any }>();

  clientType: 'Company' | 'Individual' = 'Individual';
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  clientSearch$ = new Subject<string>();
  clients: ClientDto[] = [];
  clientsLoading = false;
  selectedClient: ClientDto | null = null;

  sources: LookupDto[] = [];

  readonly DEFAULT_COUNTRY = 'SA';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadSources();
    this.setupClientSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      clientNameAr:         [''],
      clientNameEn:         [''],
      clientPhone:          [''],
      email:                ['', [Validators.email]],
      clientResourceId:     [null],
      // Individual
      individualAddress:    [''],
      // Company
      taxNumber:            [''],
      commercialRegister:   [''],
      streetName:           [''],
      additionalStreetName: [''],
      cityName:             [''],
      postalZone:           [''],
      countrySubentity:     [''],
      countryCode:          [this.DEFAULT_COUNTRY],
      citySubdivisionName:  [''],
      buildingNumber:       [''],
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(val => this.emitChange(val));
  }

  private loadSources(): void {
    this.api.post<any>('ClientResources/pagination', { currentPage: 1, itemsPerPage: 100, textSearch: '', sort: 'nameAr', desc: false })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => (this.sources = res?.data?.items ?? []) });
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
    });
  }

  setClientType(type: 'Company' | 'Individual'): void {
    this.clientType = type;
    this.resetForm();
    this.selectedClient = null;
  }

  onClientSelected(client: ClientDto | null): void {
    this.selectedClient = client;
    if (!client) { this.resetForm(); return; }
    this.form.patchValue({
      clientNameAr:         client.nameAr ?? '',
      clientNameEn:         client.nameEn ?? '',
      clientPhone:          client.phoneNumber ?? '',
      email:                client.email ?? '',
      individualAddress:    client.address ?? '',
      clientResourceId:     client.sourceId ?? null,
      taxNumber:            client.taxNumber ?? '',
      commercialRegister:   client.commercialRegister ?? '',
      streetName:           client.streetName ?? '',
      additionalStreetName: client.additionalStreetName ?? '',
      cityName:             client.cityName ?? '',
      postalZone:           client.postalZone ?? '',
      countrySubentity:     client.countrySubentity ?? '',
      countryCode:          client.countryCode ?? this.DEFAULT_COUNTRY,
      citySubdivisionName:  client.citySubdivisionName ?? '',
      buildingNumber:       client.buildingNumber ?? '',
    });
    this.emitChange(this.form.value);
  }

  private resetForm(): void {
    this.form.reset({ countryCode: this.DEFAULT_COUNTRY });
  }

  private emitChange(val: any): void {
    this.clientChange.emit({
      id: this.selectedClient?.id,
      type: this.clientType,
      data: { ...val, clientType: this.clientType },
    });
  }
}
