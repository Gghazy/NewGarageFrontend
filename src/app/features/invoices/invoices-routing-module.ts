import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceForm } from './invoice-form/invoice-form';
import { InvoiceList } from './invoice-list/invoice-list';
import { InvoicesLayout } from './invoices-layout';

const routes: Routes = [
  {
    path: '',
    component: InvoicesLayout,
    data: { breadcrumb: 'BREADCRUMB.INVOICES' },
    children: [
      {
        path: '',
        component: InvoiceList,
        data: { breadcrumb: '' }
      },
      {
        path: ':id',
        component: InvoiceForm,
        data: { breadcrumb: 'BREADCRUMB.INVOICE_DETAILS' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
