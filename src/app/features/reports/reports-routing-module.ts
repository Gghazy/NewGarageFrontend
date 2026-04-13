import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceReport } from './invoice-report/invoice-report';
import { EmployeeExaminationReport } from './employee-examination-report/employee-examination-report';
import { RevenueComparisonReport } from './revenue-comparison-report/revenue-comparison-report';
import { EmployeeComparisonReport } from './employee-comparison-report/employee-comparison-report';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    data: { breadcrumb: 'BREADCRUMB.REPORTS' },
    children: [
      { path: '', redirectTo: 'invoices', pathMatch: 'full' },
      {
        path: 'invoices',
        component: InvoiceReport,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.INVOICE_REPORT',
          permissions: ['invoice.read'],
          permissionMode: 'any',
        },
      },
      {
        path: 'employees',
        component: EmployeeExaminationReport,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EMPLOYEE_REPORT',
          permissions: ['examination.read'],
          permissionMode: 'any',
        },
      },
      {
        path: 'revenue-comparison',
        component: RevenueComparisonReport,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.REVENUE_COMPARISON',
          permissions: ['dashboard.revenue'],
          permissionMode: 'any',
        },
      },
      {
        path: 'employee-comparison',
        component: EmployeeComparisonReport,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EMPLOYEE_COMPARISON',
          permissions: ['examination.read'],
          permissionMode: 'any',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
