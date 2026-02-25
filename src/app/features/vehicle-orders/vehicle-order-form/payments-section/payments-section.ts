import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/core/services/custom.service';
import { ExaminationDto, PaymentDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';

@Component({
  selector: 'app-payments-section',
  standalone: false,
  templateUrl: './payments-section.html',
  styleUrl: './payments-section.css',
})
export class PaymentsSection {
  @Input() examination!: ExaminationDto;
  @Output() paymentAdded = new EventEmitter<void>();

  collapsed = false;
  showForm = false;
  formMode: 'Payment' | 'Refund' = 'Payment';
  form!: FormGroup;
  saving = false;
  private destroy$ = new Subject<void>();

  paymentMethods = ['Cash', 'Card', 'BankTransfer', 'Cheque'];

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

  get payments(): PaymentDto[] {
    return this.examination?.payments ?? [];
  }

  get totalPaid(): number {
    return this.examination?.totalPaid ?? 0;
  }

  get totalRefunded(): number {
    return this.examination?.totalRefunded ?? 0;
  }

  get balance(): number {
    return this.examination?.balance ?? 0;
  }

  get subTotal(): number {
    return this.examination?.subTotal ?? 0;
  }

  get taxRate(): number {
    return this.examination?.taxRate ?? 0.15;
  }

  get taxAmount(): number {
    return this.examination?.taxAmount ?? 0;
  }

  get totalWithTax(): number {
    return this.examination?.totalWithTax ?? 0;
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
    const endpoint = this.formMode === 'Payment'
      ? `Examinations/${this.examination.id}/payments`
      : `Examinations/${this.examination.id}/refunds`;

    this.api.post<any>(endpoint, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const msgKey = this.formMode === 'Payment'
            ? 'VEHICLE_ORDERS.PAYMENTS.PAYMENT_ADDED'
            : 'VEHICLE_ORDERS.PAYMENTS.REFUND_ADDED';
          this.toastr.success(this.translate.instant(msgKey));
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
