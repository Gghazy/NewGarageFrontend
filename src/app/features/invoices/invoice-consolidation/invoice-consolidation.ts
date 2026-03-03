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
    forkJoin([
      this.invoiceService.getByExamination(examinationId),
      this.api.get<ApiResponse<ExaminationDto>>(`Examinations/${examinationId}`),
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([invoiceRes, examRes]) => {
          this.invoices = invoiceRes.data ?? [];
          this.examination = examRes.data;
          if (this.invoices.length === 0) {
            this.loading = false;
            return;
          }
          this.consolidateData();
          if (this.consolidated && this.examination) {
            this.consolidated.manufacturerNameAr = this.examination.manufacturerNameAr;
            this.consolidated.manufacturerNameEn = this.examination.manufacturerNameEn;
            this.consolidated.carMarkNameAr = this.examination.carMarkNameAr;
            this.consolidated.carMarkNameEn = this.examination.carMarkNameEn;
            this.consolidated.year = this.examination.year;
            this.consolidated.color = this.examination.color;
            this.consolidated.vin = this.examination.vin;
            this.consolidated.plateLetters = this.examination.plateLetters;
            this.consolidated.plateNumbers = this.examination.plateNumbers;
          }
          this.loading = false;
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

    // Single pass: accumulate items + financial totals, accounting for invoice type
    const itemMap = new Map<string, ConsolidatedItemDto>();
    let discountAmount = 0, taxAmount = 0, totalWithTax = 0, totalPaid = 0;

    for (const inv of this.invoices) {
      const sign = inv.type === 'Refund' ? -1 : 1;
      discountAmount += sign * inv.discountAmount;
      taxAmount      += sign * inv.taxAmount;
      totalWithTax   += sign * inv.totalWithTax;
      totalPaid      += inv.totalPaid;

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

    const items = Array.from(itemMap.values()).filter(it => Math.abs(it.totalPrice) > 0.001);
    const first = this.invoices[0];
    const subTotal = items.reduce((sum, it) => sum + it.totalPrice, 0);

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
      balance: totalWithTax - totalPaid,
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
