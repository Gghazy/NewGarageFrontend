import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { ClientDto } from 'src/app/shared/Models/clients/client-dto';
import { ClientForm } from 'src/app/features/management-clients/clients/client-form/client-form';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';

@Component({
  selector: 'app-client-section',
  standalone: false,
  templateUrl: './client-section.html',
  styleUrl: './client-section.css',
})
export class ClientSection implements OnInit, OnDestroy {
  @Input() examination?: ExaminationDto;
  @Output() clientChange = new EventEmitter<{ id?: string; type: string; data: any }>();

  collapsed = false;
  private destroy$ = new Subject<void>();

  clientSearch$ = new Subject<string>();
  clients: ClientDto[] = [];
  clientsLoading = false;
  selectedClientId: string | null = null;

  private pendingSelectName: string | null = null;

  constructor(
    private api: ApiService,
    private modal: NgbModal,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.setupClientSearch();

    if (this.examination) {
      this.loadExistingClient();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExistingClient(): void {
    if (!this.examination?.clientId) return;

    this.api.post<any>('Clients/pagination', {
      currentPage: 1, itemsPerPage: 20,
      textSearch: this.examination.clientNameAr ?? '',
      sort: 'nameAr', desc: false,
    }).pipe(
      takeUntil(this.destroy$),
      catchError(() => of({ data: { items: [] } })),
    ).subscribe(res => {
      this.clients = res?.data?.items ?? [];
      const found = this.clients.find(c => c.id === this.examination!.clientId);
      if (found) {
        this.selectedClientId = found.id!;
        this.onClientSelected(found);
      }
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

      // Auto-select newly added client after modal success
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
    if (!client) {
      this.clientChange.emit({ type: 'Individual', data: {} });
      return;
    }
    this.clientChange.emit({
      id: client.id,
      type: client.typeEn ?? 'Individual',
      data: {
        clientNameAr:         client.nameAr,
        clientNameEn:         client.nameEn,
        clientPhone:          client.phoneNumber,
        email:                client.email,
        clientResourceId:     client.sourceId,
        individualAddress:    client.address,
        taxNumber:            client.taxNumber,
        commercialRegister:   client.commercialRegister,
        streetName:           client.streetName,
        additionalStreetName: client.additionalStreetName,
        cityName:             client.cityName,
        postalZone:           client.postalZone,
        countrySubentity:     client.countrySubentity,
        countryCode:          client.countryCode ?? 'SA',
        buildingNumber:       client.buildingNumber,
        citySubdivisionName:  client.citySubdivisionName,
        clientType:           client.typeEn ?? 'Individual',
      },
    });
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
}
