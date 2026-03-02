import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceDto, InvoiceHistoryDto, InvoiceItemDto } from 'src/app/shared/Models/invoices/invoice-dto';

@Component({
  selector: 'app-invoice-form',
  standalone: false,
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.css',
})
export class InvoiceForm implements OnInit, OnDestroy {
  loading = false;
  invoiceId?: string;
  invoice?: InvoiceDto;
  itemsCollapsed = false;
  summaryCollapsed = false;
  relatedCollapsed = false;
  historyCollapsed = true;
  historyItems: InvoiceHistoryDto[] = [];
  historyLoading = false;
  displayItems: InvoiceItemDto[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.invoiceId = params.get('id') ?? undefined;
        if (this.invoiceId) {
          this.loadInvoice();
        } else {
          this.router.navigate(['/features/invoices']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoice(): void {
    this.loading = true;
    this.api.get<any>(`Invoices/${this.invoiceId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const invoice = res.data as InvoiceDto;
          if (!invoice.relatedInvoices || invoice.relatedInvoices.length <= 1) {
            this.router.navigate(['/features/invoices', this.invoiceId, 'view'], { replaceUrl: true });
            return;
          }
          this.invoice = invoice;
          this.loading = false;
          this.loadNetItems();
          this.loadHistory();
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.router.navigate(['/features/invoices']);
        },
      });
  }

  private loadNetItems(): void {
    if (!this.invoice) return;

    const refunds = (this.invoice.relatedInvoices ?? [])
      .filter(r => r.type === 'Refund' && r.status !== 'Cancelled' && r.id !== this.invoice!.id);

    if (refunds.length === 0) {
      this.displayItems = this.invoice.items;
      return;
    }

    const requests = refunds.map(r => this.api.get<any>(`Invoices/${r.id}`));
    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (responses) => {
          const refundMap = new Map<string, number>();
          for (const res of responses) {
            for (const item of (res.data as InvoiceDto).items) {
              const key = item.serviceId || item.description;
              refundMap.set(key, (refundMap.get(key) || 0) + item.totalPrice);
            }
          }
          this.displayItems = this.invoice!.items.map(item => {
            const key = item.serviceId || item.description;
            const refunded = refundMap.get(key) || 0;
            if (refunded > 0) {
              return { ...item, totalPrice: item.totalPrice - refunded };
            }
            return item;
          });
        },
        error: () => {
          this.displayItems = this.invoice?.items ?? [];
        },
      });
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.api.get<any>(`Invoices/${this.invoiceId}/history`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.historyItems = res.data ?? [];
          this.historyLoading = false;
        },
        error: () => {
          this.historyLoading = false;
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
      RefundAdded: 'bi-arrow-return-left',
      DiscountSet: 'bi-percent',
      ItemAdded: 'bi-bag-plus',
      ItemRemoved: 'bi-bag-dash',
      ItemUpdated: 'bi-bag-check',
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
      ItemAdded: '#06b6d4',
      ItemRemoved: '#f97316',
      ItemUpdated: '#3b82f6',
      StatusChanged: '#64748b',
      RefundInvoiceCreated: '#f59e0b',
    };
    return colors[action] ?? '#64748b';
  }

  getPerformerName(item: InvoiceHistoryDto): string {
    if (this.isAr) {
      return item.performedByNameAr || item.performedByNameEn || '';
    }
    return item.performedByNameEn || item.performedByNameAr || '';
  }

  get refundInvoicesTotal(): number {
    if (!this.invoice?.relatedInvoices) return 0;
    return this.invoice.relatedInvoices
      .filter(r => r.type === 'Refund' && r.status !== 'Cancelled')
      .reduce((sum, r) => sum + r.totalWithTax, 0);
  }

  get netTotalWithTax(): number {
    if (!this.invoice) return 0;
    return this.invoice.totalWithTax - this.refundInvoicesTotal;
  }

  get netBalance(): number {
    if (!this.invoice) return 0;
    return this.netTotalWithTax - this.invoice.totalPaid;
  }

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  goBack(): void {
    this.router.navigate(['/features/invoices']);
  }
}
