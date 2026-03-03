import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared-module';
import { InvoicesRoutingModule } from './invoices-routing-module';
import { InvoiceService } from './invoice.service';
import { InvoicePrintService } from './invoice-print.service';
import { InvoiceList } from './invoice-list/invoice-list';
import { InvoiceDetail } from './invoice-detail/invoice-detail';
import { InvoiceConsolidation } from './invoice-consolidation/invoice-consolidation';
import { InvoicesLayout } from './invoices-layout';

@NgModule({
  declarations: [
    InvoicesLayout,
    InvoiceList,
    InvoiceDetail,
    InvoiceConsolidation,
  ],
  imports: [
    CommonModule,
    SharedModule,
    InvoicesRoutingModule,
  ],
  providers: [
    InvoiceService,
    InvoicePrintService,
  ],
})
export class InvoicesModule {}
