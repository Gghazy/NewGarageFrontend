import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';

@Component({
  selector: 'app-invoice-discount-section',
  standalone: false,
  templateUrl: './discount-section.html',
  styleUrl: './discount-section.css',
})
export class InvoiceDiscountSection implements OnDestroy {
  @Input() invoice!: InvoiceDto;
  @Output() discountSaved = new EventEmitter<void>();

  collapsed = false;
  discountInput = 0;
  saving = false;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(): void {
    if (this.invoice) {
      this.discountInput = this.invoice.discountAmount ?? 0;
    }
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.api.put<any>(`Invoices/${this.invoice.id}/discount`, this.discountInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success(this.translate.instant('COMMON.SUCCESS'));
          this.saving = false;
          this.discountSaved.emit();
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
