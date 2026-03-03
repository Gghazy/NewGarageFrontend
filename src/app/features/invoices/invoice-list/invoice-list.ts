import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceService } from '../invoice.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-invoice-list',
  standalone: false,
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css',
})
export class InvoiceList implements OnInit, OnDestroy {
  invoices: InvoiceDto[] = [];
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  selectedIds = new Set<string>();
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
    private modal: NgbModal,
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

  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  get isAllSelected(): boolean {
    return this.invoices.length > 0 && this.invoices.every(inv => this.selectedIds.has(inv.id));
  }

  toggleAll(): void {
    if (this.isAllSelected) {
      this.invoices.forEach(inv => this.selectedIds.delete(inv.id));
    } else {
      this.invoices.forEach(inv => this.selectedIds.add(inv.id));
    }
  }

  openConsolidation(): void {
    const selected = this.invoices.filter(inv => this.selectedIds.has(inv.id));
    const examIds = new Set(selected.map(inv => inv.examinationId).filter(Boolean));

    if (examIds.size > 1) {
      this.toastr.warning(this.translate.instant('INVOICES.CONSOLIDATION.SAME_EXAM_REQUIRED'));
      return;
    }

    if (examIds.size === 1) {
      const examinationId = examIds.values().next().value;
      this.router.navigate(['/features/invoices/consolidate'], { queryParams: { examinationId } });
    } else {
      const ids = Array.from(this.selectedIds).join(',');
      this.router.navigate(['/features/invoices/consolidate'], { queryParams: { ids } });
    }
  }

  consolidateByExamination(inv: InvoiceDto): void {
    this.router.navigate(['/features/invoices/consolidate'], {
      queryParams: { examinationId: inv.examinationId },
    });
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.loadInvoices();
  }

  deleteInvoice(invoice: InvoiceDto): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result
      .then(() => {
        this.invoiceService.delete(invoice.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'));
              this.loadInvoices();
            },
            error: (err) => this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED')),
          });
      })
      .catch(() => {});
  }
}
