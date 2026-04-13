import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared-module';
import { ReportsRoutingModule } from './reports-routing-module';
import { InvoiceReport } from './invoice-report/invoice-report';
import { EmployeeExaminationReport } from './employee-examination-report/employee-examination-report';
import { RevenueComparisonReport } from './revenue-comparison-report/revenue-comparison-report';
import { EmployeeComparisonReport } from './employee-comparison-report/employee-comparison-report';

@NgModule({
  declarations: [
    InvoiceReport,
    EmployeeExaminationReport,
    RevenueComparisonReport,
    EmployeeComparisonReport,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReportsRoutingModule,
  ],
})
export class ReportsModule {}
