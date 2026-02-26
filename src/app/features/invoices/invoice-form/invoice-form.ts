import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';
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
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.router.navigate(['/features/invoices']);
        },
      });
  }

  printInvoice(): void {
    if (this.invoice) {
      this.printService.print(this.invoice);
    }
  }

  goBack(): void {
    this.router.navigate(['/features/invoices']);
  }
}
