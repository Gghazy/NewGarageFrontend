import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared-module';
import { ReportsRoutingModule } from './reports-routing-module';
import { InvoiceReport } from './invoice-report/invoice-report';
import { EmployeeExaminationReport } from './employee-examination-report/employee-examination-report';

@NgModule({
  declarations: [
    InvoiceReport,
    EmployeeExaminationReport,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReportsRoutingModule,
  ],
})
export class ReportsModule {}
