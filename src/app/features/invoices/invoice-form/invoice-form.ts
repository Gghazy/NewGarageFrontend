import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceDto, InvoiceHistoryDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { InvoicePrintService } from './invoice-print.service';

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
  historyItems: InvoiceHistoryDto[] = [];
  historyLoading = false;
  historyCollapsed = true;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private translate: TranslateService,
    private printService: InvoicePrintService,
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
          this.invoice = res.data;
          this.loading = false;
          this.loadHistory();
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.router.navigate(['/features/invoices']);
        },
      });
  }

  async printInvoice(): Promise<void> {
    if (this.invoice) {
      await this.printService.print(this.invoice);
    }
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

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  goBack(): void {
    this.router.navigate(['/features/invoices']);
  }
}
