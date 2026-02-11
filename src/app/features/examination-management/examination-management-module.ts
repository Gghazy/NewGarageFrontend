import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExaminationManagementRoutingModule } from './examination-management-routing-module';
import { ExaminationManagement } from './examination-management';


@NgModule({
  declarations: [ExaminationManagement],
  imports: [
    CommonModule,
    ExaminationManagementRoutingModule
  ]
})
export class ExaminationManagementModule { }
