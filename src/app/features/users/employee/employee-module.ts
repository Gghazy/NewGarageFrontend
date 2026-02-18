import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeRoutingModule } from './employee-routing-module';
import { EmployeeList } from './employee-list/employee-list';
import { SharedModule } from 'src/app/shared/shared-module';
import { EmployeeForm } from './employee-form/employee-form';


@NgModule({
  declarations: [EmployeeList, EmployeeForm],
  imports: [
    CommonModule,
    EmployeeRoutingModule,
    SharedModule
  ]
})
export class EmployeeModule { }
