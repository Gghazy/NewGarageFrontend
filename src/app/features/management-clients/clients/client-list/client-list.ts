import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientForm } from '../client-form/client-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';
import { ClientDto } from 'src/app/shared/Models/clients/client-dto';
import { PaginatedResponse } from 'src/app/shared/Models/api-response';

@Component({
  selector: 'app-client-list',
  standalone: false,
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit, OnDestroy {
  clients: ClientDto[] = [];
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'nameEn',
    desc: false,
    totalItems: 0
  };

  constructor(
    private apiService: ApiService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClients() {
    this.apiService.post<PaginatedResponse<ClientDto>>('Clients/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.clients = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
        },
        error: (err) => {
          console.error('[ClientList] Failed to load clients:', err);
          this.toastr.error(this.translate.instant('COMMON.ERROR'), 'Error');
        }
      });
  }

  openAddClient() {
    const ref = this.modal.open(ClientForm, { centered: true, backdrop: 'static', size: 'lg' });
    ref.componentInstance.title = this.translate.instant('CLIENTS.FORM.TITLE_ADD');

    ref.result.then(() => this.loadClients()).catch(() => {});
  }

  openEditClient(client: ClientDto) {
    const ref = this.modal.open(ClientForm, { centered: true, backdrop: 'static', size: 'lg' });
    ref.componentInstance.title = this.translate.instant('CLIENTS.FORM.TITLE_EDIT');
    ref.componentInstance.client = client;
    ref.componentInstance.clientId = client.id; // backend must return id in ClientDto

    ref.result.then(() => this.loadClients()).catch(() => {});
  }

  deleteClient(client: ClientDto) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`Clients/${client.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.loadClients();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.loadClients();
  }

  exportToExcel() {
    const request = { ...this.pagingConfig, itemsPerPage: 100000, currentPage: 1 };
    this.apiService.post<PaginatedResponse<ClientDto>>('Clients/pagination', request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items = res.data.items ?? [];
          if (items.length === 0) {
            this.toastr.info(this.translate.instant('CLIENTS.EMPTY'));
            return;
          }
          this.downloadCsv(items);
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  private downloadCsv(items: ClientDto[]) {
    const t = (key: string) => this.translate.instant(key);

    const headers = [
      '#',
      t('CLIENTS.TABLE.NAME'),
      t('CLIENTS.TABLE.TYPE'),
      t('CLIENTS.TABLE.EMAIL'),
      t('CLIENTS.TABLE.PHONE'),
      t('CLIENTS.TABLE.EXAMINATION_COUNT'),
      t('CLIENTS.TABLE.TOTAL_REVENUE'),
      t('CLIENTS.TABLE.POINTS'),
    ];

    const rows = items.map((c, i) => [
      (i + 1).toString(),
      this.translate.currentLang === 'ar' ? c.nameAr : c.nameEn,
      this.translate.currentLang === 'ar' ? c.typeAr : c.typeEn,
      c.email ?? '',
      c.phoneNumber ?? '',
      c.examinationCount?.toString() ?? '0',
      (c.totalRevenue ?? 0).toFixed(2),
      (c.points ?? 0).toString(),
    ]);

    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
