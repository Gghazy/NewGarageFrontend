import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeList } from './employee-list/employee-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
    {
      path: '',
      component: EmployeeList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.EMPLOYEES',
        permissions: ['employees.read'],
        permissionMode: 'any'
      }
  
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
