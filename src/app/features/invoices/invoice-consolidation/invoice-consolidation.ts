import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { InvoiceService } from '../invoice.service';
import { InvoicePrintService } from '../invoice-print.service';
import { ConsolidatedInvoiceData, InvoiceDto, InvoiceHistoryDto } from 'src/app/shared/Models/invoices/invoice-dto';

@Component({
  selector: 'app-invoice-consolidation',
  standalone: false,
  templateUrl: './invoice-consolidation.html',
  styleUrl: './invoice-consolidation.css',
})
export class InvoiceConsolidation implements OnInit, OnDestroy {
  loading = true;
  consolidated: ConsolidatedInvoiceData | null = null;
  invoices: InvoiceDto[] = [];
  history: (InvoiceHistoryDto & { invoiceNumber?: string })[] = [];
  infoCollapsed = false;
  invoicesCollapsed = false;
  itemsCollapsed = false;
  summaryCollapsed = false;
  historyCollapsed = true;
  private destroy$ = new Subject<void>();
  private examinationId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private printService: InvoicePrintService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    this.examinationId = this.route.snapshot.queryParamMap.get('examinationId');
    if (!this.examinationId) {
      this.loading = false;
      return;
    }
    this.invoiceService.getConsolidated(this.examinationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.consolidated = res.data;
          this.loading = false;
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.loading = false;
        },
      });

    this.invoiceService.getByExamination(this.examinationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoices = res.data ?? [];
          this.loadAllHistory();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAllHistory(): void {
    if (this.invoices.length === 0) return;
    const requests = this.invoices.map(inv => this.invoiceService.getHistory(inv.id));
    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.history = results
            .flatMap((res, idx) => (res.data ?? []).map(h => ({
              ...h,
              invoiceNumber: this.invoices[idx].invoiceNumber,
            })))
            .sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
        },
      });
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      Created: 'bi-plus-circle-fill',
      Updated: 'bi-pencil-fill',
      Cancelled: 'bi-x-circle-fill',
      Deleted: 'bi-trash-fill',
      PaymentAdded: 'bi-cash-stack',
      RefundAdded: 'bi-arrow-counterclockwise',
      DiscountSet: 'bi-tag-fill',
      ItemAdded: 'bi-plus-square-fill',
      ItemRemoved: 'bi-dash-square-fill',
      ItemUpdated: 'bi-pencil-square',
      StatusChanged: 'bi-arrow-repeat',
      RefundInvoiceCreated: 'bi-receipt-cutoff',
    };
    return icons[action] ?? 'bi-clock-history';
  }

  getActionColor(action: string): string {
    const colors: Record<string, string> = {
      Created: '#22c55e',
      Updated: '#3b82f6',
      Cancelled: '#ef4444',
      Deleted: '#ef4444',
      PaymentAdded: '#10b981',
      RefundAdded: '#f59e0b',
      DiscountSet: '#8b5cf6',
      ItemAdded: '#22c55e',
      ItemRemoved: '#ef4444',
      ItemUpdated: '#3b82f6',
      StatusChanged: '#06b6d4',
      RefundInvoiceCreated: '#f97316',
    };
    return colors[action] ?? '#64748b';
  }

  getPerformerName(item: InvoiceHistoryDto & { invoiceNumber?: string }): string {
    if (this.isAr) {
      return item.performedByNameAr || item.performedByNameEn || '';
    }
    return item.performedByNameEn || item.performedByNameAr || '';
  }

  openInvoice(id: string): void {
    this.router.navigate(['/features/invoices', id]);
  }

  print(): void {
    if (this.consolidated) {
      this.printService.printConsolidated(this.consolidated);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
