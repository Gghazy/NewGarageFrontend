import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceDto, InvoicePaymentDto } from 'src/app/shared/Models/invoices/invoice-dto';

@Component({
  selector: 'app-invoice-payments-section',
  standalone: false,
  templateUrl: './payments-section.html',
  styleUrl: './payments-section.css',
})
export class InvoicePaymentsSection implements OnInit, OnDestroy {
  @Input() invoice!: InvoiceDto;
  @Output() paymentAdded = new EventEmitter<void>();

  collapsed = false;
  showForm = false;
  formMode: 'Payment' | 'Refund' = 'Payment';
  form!: FormGroup;
  saving = false;
  private destroy$ = new Subject<void>();

  paymentMethods: { nameAr: string; nameEn: string }[] = [];
  private methodMap = new Map<string, { nameAr: string; nameEn: string }>();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {
    this.form = this.fb.group({
      amount:   [null, [Validators.required, Validators.min(0.01)]],
      method:   ['Cash', Validators.required],
      notes:    [null],
    });
  }

  ngOnInit(): void {
    this.api.get<any[]>('PaymentMethods')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (methods) => {
          this.paymentMethods = methods;
          this.methodMap.clear();
          methods.forEach(m => this.methodMap.set(m.nameEn, m));
        },
      });
  }

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  getMethodLabel(method: string): string {
    const m = this.methodMap.get(method);
    if (m) return this.translate.currentLang === 'ar' ? m.nameAr : m.nameEn;
    return this.translate.instant('INVOICES.PAYMENTS.METHODS.' + method);
  }

  get payments(): InvoicePaymentDto[] {
    return this.invoice?.payments ?? [];
  }

  get totalPaid(): number {
    return this.invoice?.totalPaid ?? 0;
  }

  get totalRefunded(): number {
    return this.invoice?.totalRefunded ?? 0;
  }

  get balance(): number {
    return this.invoice?.balance ?? 0;
  }

  get subTotal(): number {
    return this.invoice?.subTotal ?? 0;
  }

  get discountAmount(): number {
    return this.invoice?.discountAmount ?? 0;
  }

  get taxRate(): number {
    return this.invoice?.taxRate ?? 0.15;
  }

  get taxAmount(): number {
    return this.invoice?.taxAmount ?? 0;
  }

  get totalWithTax(): number {
    return this.invoice?.totalWithTax ?? 0;
  }

  openForm(mode: 'Payment' | 'Refund'): void {
    this.formMode = mode;
    this.form.reset({ amount: null, method: 'Cash', notes: null });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
  }

  submit(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const payload = this.form.value;
    const endpoint = this.formMode === 'Refund'
      ? `Invoices/${this.invoice.id}/refunds`
      : `Invoices/${this.invoice.id}/payments`;

    const successKey = this.formMode === 'Refund'
      ? 'INVOICES.PAYMENTS.REFUND_ADDED'
      : 'INVOICES.PAYMENTS.PAYMENT_ADDED';

    this.api.post<any>(endpoint, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant(successKey));
          this.showForm = false;
          this.saving = false;
          this.paymentAdded.emit();
        },
        error: (err) => {
          this.saving = false;
          this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
