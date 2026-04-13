import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { ApiResponse, PaginatedResponse } from 'src/app/shared/Models/api-response';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';

@Component({
  selector: 'app-invoice-report',
  standalone: false,
  templateUrl: './invoice-report.html',
  styleUrl: './invoice-report.css',
})
export class InvoiceReport implements OnInit, OnDestroy {
  invoices: InvoiceDto[] = [];
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 5,
    currentPage: 1,
    textSearch: '',
    sort: 'createdAtUtc',
    desc: true,
    totalItems: 0,
    dateFrom: undefined,
    dateTo: undefined,
    branchId: null,
    invoiceType: null,
    clientType: null,
  };

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadInvoices();
  }

  private get isUnrestrictedRole(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('Manager');
  }

  private loadBranches(): void {
    const employeeBranches = this.authService.getBranches();
    this.api.get<ApiResponse<any[]>>('Branches')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const all = res.data ?? [];
          this.branches = (!this.isUnrestrictedRole && employeeBranches.length > 0)
            ? all.filter((b: any) => employeeBranches.includes(b.id))
            : all;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices(): void {
    this.api.post<PaginatedResponse<InvoiceDto>>('Invoices/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoices = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.loadInvoices();
  }

  getPaymentMethods(inv: InvoiceDto): string {
    if (!inv.payments?.length) return '—';
    const methods = inv.payments
      .filter(p => p.type === 'Payment')
      .map(p => this.isAr ? p.methodNameAr : p.methodNameEn);
    return [...new Set(methods)].join(', ') || '—';
  }

  getTotalPaid(inv: InvoiceDto): number {
    if (!inv.payments?.length) return 0;
    return inv.payments
      .filter(p => p.type === 'Payment')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  exportToExcel(): void {
    const t = (key: string) => this.translate.instant(key);

    const headers = [
      t('INVOICE_REPORT.INVOICE_NUMBER'),
      t('INVOICE_REPORT.INVOICE_DATE'),
      t('INVOICE_REPORT.INVOICE_TYPE'),
      t('INVOICE_REPORT.CLIENT_NAME'),
      t('INVOICE_REPORT.PHONE'),
      t('INVOICE_REPORT.BRANCH'),
      t('INVOICE_REPORT.PAYMENT_METHOD'),
      t('INVOICE_REPORT.TOTAL'),
      t('INVOICE_REPORT.STATUS'),
    ];

    const rows = this.invoices.map(inv => [
      inv.invoiceNumber || '',
      inv.createdAtUtc ? new Date(inv.createdAtUtc).toLocaleDateString('en-GB') : '',
      t('INVOICES.LIST.TYPES.' + inv.type),
      (this.isAr ? inv.clientNameAr : inv.clientNameEn) || '',
      inv.clientPhone || '',
      (this.isAr ? inv.branchNameAr : inv.branchNameEn) || '',
      this.getPaymentMethods(inv),
      inv.netTotal.toFixed(2),
      t('INVOICES.LIST.STATUSES.' + inv.status),
    ]);

    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
