import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';

export interface BranchRevenueDto {
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;
  invoiceCount: number;
  invoiceTotal: number;
  refundCount: number;
  refundTotal: number;
  netRevenue: number;
  discountTotal: number;
  currency: string;
}

export interface PeriodSummaryDto {
  branches: BranchRevenueDto[];
  grandInvoiceTotal: number;
  grandRefundTotal: number;
  grandNetRevenue: number;
  grandDiscountTotal: number;
  grandInvoiceCount: number;
  grandRefundCount: number;
  currency: string;
}

export interface RevenueComparisonResponse {
  period1: PeriodSummaryDto;
  period2: PeriodSummaryDto;
}

export interface MergedBranchRow {
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;
  p1NetRevenue: number;
  p1InvoiceCount: number;
  p1InvoiceTotal: number;
  p1RefundTotal: number;
  p2NetRevenue: number;
  p2InvoiceCount: number;
  p2InvoiceTotal: number;
  p2RefundTotal: number;
  diff: number;
  changePercent: number | null;
}

@Component({
  selector: 'app-revenue-comparison-report',
  standalone: false,
  templateUrl: './revenue-comparison-report.html',
  styleUrl: './revenue-comparison-report.css',
})
export class RevenueComparisonReport implements OnInit, OnDestroy {
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  data: RevenueComparisonResponse | null = null;
  mergedRows: MergedBranchRow[] = [];
  private destroy$ = new Subject<void>();

  // Period 1
  from1 = '';
  to1 = '';
  // Period 2
  from2 = '';
  to2 = '';
  // Branch filter
  branchId: string | null = null;

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

  get canSearch(): boolean {
    return !!this.from1 && !!this.to1 && !!this.from2 && !!this.to2;
  }

  search(): void {
    if (!this.canSearch) {
      this.toastr.warning(this.translate.instant('REVENUE_COMPARISON.SELECT_PERIODS'));
      return;
    }

    const params: Record<string, string> = {
      from1: this.from1,
      to1: this.to1,
      from2: this.from2,
      to2: this.to2,
    };
    if (this.branchId) params['branchId'] = this.branchId;

    this.api.get<ApiResponse<RevenueComparisonResponse>>('Invoices/revenue/comparison', { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.buildMergedRows();
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  private buildMergedRows(): void {
    if (!this.data) { this.mergedRows = []; return; }

    const map = new Map<string, MergedBranchRow>();

    for (const b of this.data.period1.branches) {
      map.set(b.branchId, {
        branchId: b.branchId,
        branchNameAr: b.branchNameAr,
        branchNameEn: b.branchNameEn,
        p1NetRevenue: b.netRevenue,
        p1InvoiceCount: b.invoiceCount,
        p1InvoiceTotal: b.invoiceTotal,
        p1RefundTotal: b.refundTotal,
        p2NetRevenue: 0, p2InvoiceCount: 0, p2InvoiceTotal: 0, p2RefundTotal: 0,
        diff: 0, changePercent: null,
      });
    }

    for (const b of this.data.period2.branches) {
      const existing = map.get(b.branchId);
      if (existing) {
        existing.p2NetRevenue = b.netRevenue;
        existing.p2InvoiceCount = b.invoiceCount;
        existing.p2InvoiceTotal = b.invoiceTotal;
        existing.p2RefundTotal = b.refundTotal;
      } else {
        map.set(b.branchId, {
          branchId: b.branchId,
          branchNameAr: b.branchNameAr,
          branchNameEn: b.branchNameEn,
          p1NetRevenue: 0, p1InvoiceCount: 0, p1InvoiceTotal: 0, p1RefundTotal: 0,
          p2NetRevenue: b.netRevenue,
          p2InvoiceCount: b.invoiceCount,
          p2InvoiceTotal: b.invoiceTotal,
          p2RefundTotal: b.refundTotal,
          diff: 0, changePercent: null,
        });
      }
    }

    this.mergedRows = Array.from(map.values()).map(r => {
      r.diff = r.p2NetRevenue - r.p1NetRevenue;
      r.changePercent = r.p1NetRevenue !== 0
        ? (r.diff / r.p1NetRevenue) * 100
        : null;
      return r;
    }).sort((a, b) => b.diff - a.diff);
  }

  getBranchName(row: MergedBranchRow): string {
    return this.isAr ? row.branchNameAr : row.branchNameEn;
  }

  get grandDiff(): number {
    if (!this.data) return 0;
    return this.data.period2.grandNetRevenue - this.data.period1.grandNetRevenue;
  }

  get grandChangePercent(): number | null {
    if (!this.data || this.data.period1.grandNetRevenue === 0) return null;
    return (this.grandDiff / this.data.period1.grandNetRevenue) * 100;
  }

  exportToExcel(): void {
    if (!this.data) return;
    const t = (key: string) => this.translate.instant(key);

    const headers = [
      t('REVENUE_COMPARISON.BRANCH'),
      t('REVENUE_COMPARISON.PERIOD1') + ' - ' + t('REVENUE_COMPARISON.NET_REVENUE'),
      t('REVENUE_COMPARISON.PERIOD1') + ' - ' + t('REVENUE_COMPARISON.INVOICE_COUNT'),
      t('REVENUE_COMPARISON.PERIOD2') + ' - ' + t('REVENUE_COMPARISON.NET_REVENUE'),
      t('REVENUE_COMPARISON.PERIOD2') + ' - ' + t('REVENUE_COMPARISON.INVOICE_COUNT'),
      t('REVENUE_COMPARISON.DIFFERENCE'),
      t('REVENUE_COMPARISON.CHANGE_PERCENT'),
    ];

    const rows = this.mergedRows.map(r => [
      this.getBranchName(r),
      r.p1NetRevenue.toFixed(2),
      r.p1InvoiceCount.toString(),
      r.p2NetRevenue.toFixed(2),
      r.p2InvoiceCount.toString(),
      r.diff.toFixed(2),
      r.changePercent !== null ? r.changePercent.toFixed(1) + '%' : '-',
    ]);

    // Grand total
    rows.push([
      t('REVENUE_COMPARISON.GRAND_TOTAL'),
      this.data.period1.grandNetRevenue.toFixed(2),
      this.data.period1.grandInvoiceCount.toString(),
      this.data.period2.grandNetRevenue.toFixed(2),
      this.data.period2.grandInvoiceCount.toString(),
      this.grandDiff.toFixed(2),
      this.grandChangePercent !== null ? this.grandChangePercent.toFixed(1) + '%' : '-',
    ]);

    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
