import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-invoice-detail',
  standalone: false,
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetail implements OnInit, OnDestroy {
  invoice?: InvoiceDto;
  loading = true;

  // Payment form
  paymentMethods: { id: string; nameAr: string; nameEn: string }[] = [];
  showPaymentForm = false;
  paymentType: 'Payment' | 'Refund' = 'Payment';
  paymentAmount: number | null = null;
  paymentMethodId = '';
  paymentNotes = '';
  submittingPayment = false;

  // Discount
  discountAmount: number | null = null;
  savingDiscount = false;

  // History
  historyCollapsed = true;
  historyItems: InvoiceHistoryDto[] = [];
  historyLoaded = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
      this.loadPaymentMethods();
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
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.loading = false;
        },
      });
  }

  private loadPaymentMethods(): void {
    this.api.get<ApiResponse<any[]>>('PaymentMethods')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.paymentMethods = res.data ?? [],
      });
  }

  // -- Payment actions --

  get canAddPayment(): boolean {
    return !!this.invoice
      && this.invoice.status !== 'Cancelled'
      && this.invoice.balance > 0
      && this.invoice.type !== 'Refund';
  }

  get canAddRefund(): boolean {
    return !!this.invoice
      && this.invoice.status !== 'Cancelled'
      && this.invoice.type !== 'Refund'
      && this.invoice.totalPaid > this.invoice.totalRefunded;
  }

  openPaymentForm(type: 'Payment' | 'Refund'): void {
    this.paymentType = type;
    this.paymentAmount = null;
    this.paymentMethodId = '';
    this.paymentNotes = '';
    this.showPaymentForm = true;
  }

  get maxPaymentAmount(): number {
    if (!this.invoice) return 0;
    return this.paymentType === 'Payment'
      ? this.invoice.balance
      : this.invoice.totalPaid - this.invoice.totalRefunded;
  }

  submitPayment(): void {
    if (!this.invoice || !this.paymentAmount || !this.paymentMethodId) return;
    this.submittingPayment = true;

    const payload = {
      amount: this.paymentAmount,
      methodId: this.paymentMethodId,
      notes: this.paymentNotes || undefined,
    };

    const call$ = this.paymentType === 'Payment'
      ? this.invoiceService.addPayment(this.invoice.id, payload)
      : this.invoiceService.addRefund(this.invoice.id, payload);

    call$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const key = this.paymentType === 'Payment'
          ? 'INVOICES.PAYMENTS.PAYMENT_ADDED'
          : 'INVOICES.PAYMENTS.REFUND_ADDED';
        this.toastr.success(this.translate.instant(key));
        this.showPaymentForm = false;
        this.submittingPayment = false;
        this.loadInvoice(this.invoice!.id);
      },
      error: (err) => {
        this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
        this.submittingPayment = false;
      },
    });
  }

  cancelPaymentForm(): void {
    this.showPaymentForm = false;
  }

  // -- Discount --

  get canSetDiscount(): boolean {
    return !!this.invoice
      && this.invoice.status === 'Issued'
      && this.invoice.type !== 'Refund';
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

  // -- History --

  toggleHistory(): void {
    this.historyCollapsed = !this.historyCollapsed;
    if (!this.historyCollapsed && !this.historyLoaded) {
      this.loadHistory();
    }
  }

  private loadHistory(): void {
    if (!this.invoice) return;
    this.invoiceService.getHistory(this.invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.historyItems = res.data ?? [];
          this.historyLoaded = true;
        },
      });
  }

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      Created: 'bi-plus-circle',
      Updated: 'bi-pencil',
      Cancelled: 'bi-x-circle',
      Deleted: 'bi-trash',
      PaymentAdded: 'bi-cash',
      RefundAdded: 'bi-arrow-return-left',
      DiscountSet: 'bi-tag',
      ItemAdded: 'bi-plus-square',
      ItemRemoved: 'bi-dash-square',
      ItemUpdated: 'bi-pencil-square',
      StatusChanged: 'bi-arrow-repeat',
      RefundInvoiceCreated: 'bi-receipt',
    };
    return icons[action] || 'bi-circle';
  }

  getActionColor(action: string): string {
    const colors: Record<string, string> = {
      Created: '#198754',
      Cancelled: '#dc3545',
      Deleted: '#dc3545',
      PaymentAdded: '#198754',
      RefundAdded: '#fd7e14',
      RefundInvoiceCreated: '#fd7e14',
    };
    return colors[action] || '#6c757d';
  }

  // -- Navigation --

  openRelated(id: string): void {
    this.router.navigate(['/features/invoices', id]);
  }

  async print(): Promise<void> {
    if (this.invoice) {
      await this.printService.print(this.invoice);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
