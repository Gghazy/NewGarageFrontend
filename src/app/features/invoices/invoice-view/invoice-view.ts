import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { InvoicePrintService } from '../invoice-form/invoice-print.service';

@Component({
  selector: 'app-invoice-view',
  standalone: false,
  templateUrl: './invoice-view.html',
  styleUrl: './invoice-view.css',
})
export class InvoiceView implements OnInit, OnDestroy {
  loading = false;
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
        const id = params.get('id');
        if (id) {
          this.loadInvoice(id);
        } else {
          this.router.navigate(['/features/invoices']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInvoice(id: string): void {
    this.loading = true;
    this.api.get<any>(`Invoices/${id}`)
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

  reloadInvoice(): void {
    if (this.invoice) {
      this.loadInvoice(this.invoice.id);
    }
  }

  async printInvoice(): Promise<void> {
    if (this.invoice) {
      await this.printService.print(this.invoice);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
