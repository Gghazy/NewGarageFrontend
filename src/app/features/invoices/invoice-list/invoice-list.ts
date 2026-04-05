import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceService } from '../invoice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';

@Component({
  selector: 'app-invoice-list',
  standalone: false,
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css',
})
export class InvoiceList implements OnInit, OnDestroy {
  invoices: InvoiceDto[] = [];
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  listMode: 'all' | 'refunds' | 'cancelled' = 'all';
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'createdAtUtc',
    desc: true,
    totalItems: 0,
    dateFrom: undefined,
    dateTo: undefined,
    branchId: null,
  };

  constructor(
    private api: ApiService,
    private invoiceService: InvoiceService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get titleKey(): string {
    switch (this.listMode) {
      case 'refunds': return 'INVOICES.LIST.TITLE_REFUNDS';
      case 'cancelled': return 'INVOICES.LIST.TITLE_CANCELLED';
      default: return 'INVOICES.LIST.TITLE';
    }
  }

  ngOnInit(): void {
    this.listMode = this.route.snapshot.data['listMode'] || 'all';
    if (this.listMode === 'refunds') {
      this.pagingConfig.invoiceType = 'Refund';
    } else if (this.listMode === 'cancelled') {
      this.pagingConfig.status = 'Cancelled';
    }
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
    this.invoiceService.paginate(this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoices = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  openDetails(invoice: InvoiceDto): void {
    this.router.navigate(['/features/invoices', invoice.id]);
  }

  goToExamInvoices(inv: InvoiceDto): void {
    if (!inv.examinationId) {
      this.router.navigate(['/features/invoices', inv.id]);
      return;
    }

    this.api.get<ApiResponse<InvoiceDto[]>>(`Invoices/by-examination/${inv.examinationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const invoices = res.data ?? [];
          if (invoices.length > 1) {
            this.router.navigate(['/features/invoices/consolidate'], {
              queryParams: { examinationId: inv.examinationId },
            });
          } else {
            this.router.navigate(['/features/invoices', inv.id]);
          }
        },
      });
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.loadInvoices();
  }

}
