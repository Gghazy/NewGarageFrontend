import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceList } from './invoice-list/invoice-list';
import { InvoiceConsolidation } from './invoice-consolidation/invoice-consolidation';
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
        path: 'consolidate',
        component: InvoiceConsolidation,
        data: { breadcrumb: 'BREADCRUMB.INVOICE_CONSOLIDATION' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
