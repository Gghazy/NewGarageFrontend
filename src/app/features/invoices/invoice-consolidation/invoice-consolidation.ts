import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceService } from '../invoice.service';
import { InvoicePrintService } from '../invoice-print.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { InvoiceDto, ConsolidatedInvoiceData, ConsolidatedItemDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';

@Component({
  selector: 'app-invoice-consolidation',
  standalone: false,
  templateUrl: './invoice-consolidation.html',
  styleUrl: './invoice-consolidation.css',
})
export class InvoiceConsolidation implements OnInit, OnDestroy {
  loading = true;
  invoices: InvoiceDto[] = [];
  examination: ExaminationDto | null = null;
  consolidated: ConsolidatedInvoiceData | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private api: ApiService,
    private printService: InvoicePrintService,
    private toastr: ToastrService,
    private translate: TranslateService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    const examinationId = this.route.snapshot.queryParamMap.get('examinationId');
    if (examinationId) {
      this.loadByExamination(examinationId);
      return;
    }

    const idsParam = this.route.snapshot.queryParamMap.get('ids') || '';
    const ids = idsParam.split(',').filter(id => id.trim());
    if (ids.length === 0) {
      this.loading = false;
      return;
    }
    this.loadInvoices(ids);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadByExamination(examinationId: string): void {
    this.invoiceService.getByExamination(examinationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoices = res.data ?? [];
          if (this.invoices.length === 0) {
            this.loading = false;
            return;
          }
          this.consolidateData();
          this.loadExamination();
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.loading = false;
        },
      });
  }

  private loadInvoices(ids: string[]): void {
    const requests = ids.map(id => this.invoiceService.getById(id));
    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (responses) => {
          this.invoices = responses.map(r => r.data);
          this.consolidateData();
          this.loadExamination();
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.loading = false;
        },
      });
  }

  private loadExamination(): void {
    const examId = this.invoices.find(inv => inv.examinationId)?.examinationId;
    if (!examId) {
      this.loading = false;
      return;
    }
    this.api.get<ApiResponse<ExaminationDto>>(`Examinations/${examId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.examination = res.data;
          if (this.consolidated) {
            this.consolidated.manufacturerNameAr = res.data.manufacturerNameAr;
            this.consolidated.manufacturerNameEn = res.data.manufacturerNameEn;
            this.consolidated.carMarkNameAr = res.data.carMarkNameAr;
            this.consolidated.carMarkNameEn = res.data.carMarkNameEn;
            this.consolidated.year = res.data.year;
            this.consolidated.color = res.data.color;
            this.consolidated.vin = res.data.vin;
            this.consolidated.plateLetters = res.data.plateLetters;
            this.consolidated.plateNumbers = res.data.plateNumbers;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private consolidateData(): void {
    if (this.invoices.length === 0) return;

    // Accumulate items by serviceId, accounting for invoice type:
    // Invoice/Adjustment = add, Refund = subtract
    const itemMap = new Map<string, ConsolidatedItemDto>();
    for (const inv of this.invoices) {
      debugger
      const sign = inv.type === 'Refund' ? -1 : 1;
      for (const item of inv.items) {
        const key = item.serviceId || item.description;
        const existing = itemMap.get(key);
        if (existing) {
          existing.unitPrice += sign * item.unitPrice;
          existing.totalPrice += sign * item.totalPrice;
        } else {
          itemMap.set(key, {
            description: item.description,
            serviceNameAr: item.serviceNameAr,
            serviceNameEn: item.serviceNameEn,
            unitPrice: sign * item.unitPrice,
            totalPrice: sign * item.totalPrice,
            currency: item.currency,
          });
        }
      }
    }

    // Filter out fully refunded items (net zero)
    const items = Array.from(itemMap.values()).filter(it => Math.abs(it.totalPrice) > 0.001);
    const first = this.invoices[0];

    const subTotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
    const discountAmount = this.invoices.reduce((sum, inv) => {
      const s = inv.type === 'Refund' ? -1 : 1;
      return sum + s * inv.discountAmount;
    }, 0);
    const taxAmount = this.invoices.reduce((sum, inv) => {
      const s = inv.type === 'Refund' ? -1 : 1;
      return sum + s * inv.taxAmount;
    }, 0);
    const totalWithTax = this.invoices.reduce((sum, inv) => {
      const s = inv.type === 'Refund' ? -1 : 1;
      return sum + s * inv.totalWithTax;
    }, 0);
    const totalPaid = this.invoices.reduce((sum, inv) => sum + inv.totalPaid, 0);
    const totalRefunded = this.invoices.reduce((sum, inv) => sum + inv.totalRefunded, 0);
    const balance = totalWithTax - totalPaid + totalRefunded;

    this.consolidated = {
      clientNameAr: first.clientNameAr,
      clientNameEn: first.clientNameEn,
      clientPhone: first.clientPhone,
      items,
      subTotal,
      discountAmount,
      taxAmount,
      totalWithTax,
      totalPaid,
      balance,
      currency: first.currency,
      invoiceCount: this.invoices.length,
    };
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
