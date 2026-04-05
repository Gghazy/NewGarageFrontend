import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { InvoiceService } from '../invoice.service';
import { InvoicePrintService } from '../invoice-print.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { InvoiceDto, InvoiceHistoryDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';

@Component({
  selector: 'app-invoice-detail',
  standalone: false,
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetail implements OnInit, OnDestroy {
  invoice?: InvoiceDto;
  examination?: ExaminationDto;
  loading = true;

  // Collapse states
  infoCollapsed = false;
  vehicleCollapsed = true;
  itemsCollapsed = false;
  summaryCollapsed = false;
  discountCollapsed = false;
  paymentsCollapsed = false;
  historyCollapsed = true;

  // History
  history: InvoiceHistoryDto[] = [];
  showHistory = false;

  // Discount
  discountAmount: number | null = null;
  savingDiscount = false;

  // Payment
  paymentMethods: LookupDto[] = [];
  showPaymentForm = false;
  paymentAmount: number | null = null;
  paymentMethodId: string | null = null;
  paymentNotes: string | null = null;
  savingPayment = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private printService: InvoicePrintService,
    private api: ApiService,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInvoice(id: string): void {
    this.loading = true;
    this.invoiceService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoice = res.data;
          this.discountAmount = this.invoice.discountAmount;
          this.loading = false;
          if (this.invoice.examinationId) {
            this.loadExamination(this.invoice.examinationId);
            this.checkAndLoadHistory(id, this.invoice.examinationId);
          } else {
            this.showHistory = true;
            this.loadHistory(id);
          }
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.loading = false;
        },
      });
  }

  private checkAndLoadHistory(invoiceId: string, examinationId: string): void {
    this.invoiceService.getByExamination(examinationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const count = (res.data ?? []).length;
          if (count <= 1) {
            this.showHistory = true;
            this.loadHistory(invoiceId);
          }
        },
      });
  }

  private loadHistory(invoiceId: string): void {
    this.invoiceService.getHistory(invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.history = res.data ?? [],
      });
  }

  private loadExamination(examinationId: string): void {
    this.api.get<ApiResponse<ExaminationDto>>(`Examinations/${examinationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.examination = res.data,
      });
  }

  // -- Payment --

  get canAddPayment(): boolean {
    return !!this.invoice && this.invoice.status === 'Issued' && this.invoice.type !== 'Refund';
  }

  get totalPaid(): number {
    if (!this.invoice) return 0;
    return this.invoice.payments
      .reduce((sum, p) => sum + p.amount, 0);
  }

  get balance(): number {
    if (!this.invoice) return 0;
    return this.invoice.totalWithTax - this.totalPaid;
  }

  openPaymentForm(): void {
    if (this.paymentMethods.length === 0) {
      this.api.get<ApiResponse<LookupDto[]>>('PaymentMethods')
        .pipe(takeUntil(this.destroy$))
        .subscribe(res => {
          this.paymentMethods = res.data ?? [];
        });
    }
    this.paymentAmount = null;
    this.paymentMethodId = null;
    this.paymentNotes = null;
    this.showPaymentForm = true;
  }

  cancelPaymentForm(): void {
    this.showPaymentForm = false;
  }

  submitPayment(): void {
    if (!this.invoice || !this.paymentAmount || !this.paymentMethodId) return;
    this.savingPayment = true;
    const payload = {
      amount: this.paymentAmount,
      methodId: this.paymentMethodId,
      notes: this.paymentNotes,
    };
    const call$ = this.invoiceService.addPayment(this.invoice.id, payload);
    call$.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('COMMON.SAVED_SUCCESSFULLY'));
          this.savingPayment = false;
          this.showPaymentForm = false;
          this.loadInvoice(this.invoice!.id);
        },
        error: (err) => {
          this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
          this.savingPayment = false;
        },
      });
  }

  // -- Discount --

  get canSetDiscount(): boolean {
    return !!this.invoice
      && this.invoice.status === 'Issued'
      && this.invoice.type !== 'Refund'
      && this.invoice.type !== 'Adjustment';
  }

  saveDiscount(): void {
    if (!this.invoice || this.discountAmount == null) return;
    this.savingDiscount = true;
    this.invoiceService.setDiscount(this.invoice.id, this.discountAmount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('COMMON.SAVED_SUCCESSFULLY'));
          this.savingDiscount = false;
          this.loadInvoice(this.invoice!.id);
        },
        error: (err) => {
          this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
          this.savingDiscount = false;
        },
      });
  }

  // -- History helpers --

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

  getPerformerName(item: InvoiceHistoryDto): string {
    if (this.isAr) {
      return item.performedByNameAr || item.performedByNameEn || '';
    }
    return item.performedByNameEn || item.performedByNameAr || '';
  }

  // -- Navigation --

  async print(): Promise<void> {
    if (this.invoice) {
      await this.printService.print(this.invoice);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
