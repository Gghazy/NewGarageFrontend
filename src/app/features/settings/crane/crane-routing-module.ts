import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { CraneList } from './crane-list/crane-list';

const routes: Routes = [
   {
      path: '',
      component: CraneList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.CRANES',
        permissions: ['crane.read'],
        permissionMode: 'any'
      }
  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CraneRoutingModule { }
