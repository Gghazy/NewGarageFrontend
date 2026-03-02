import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared-module';
import { InvoicesRoutingModule } from './invoices-routing-module';
import { InvoiceForm } from './invoice-form/invoice-form';
import { InvoicePaymentsSection } from './invoice-form/payments-section/payments-section';
import { InvoiceDiscountSection } from './invoice-form/discount-section/discount-section';
import { InvoiceView } from './invoice-view/invoice-view';
import { InvoiceList } from './invoice-list/invoice-list';
import { InvoicesLayout } from './invoices-layout';

@NgModule({
  declarations: [
    InvoicesLayout,
    InvoiceList,
    InvoiceForm,
    InvoiceView,
    InvoicePaymentsSection,
    InvoiceDiscountSection,
  ],
  imports: [
    CommonModule,
    SharedModule,
    InvoicesRoutingModule,
  ],
})
export class InvoicesModule {}
