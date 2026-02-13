import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { ServiceList } from './service-list/service-list';

const routes: Routes = [
   {
      path: '',
      component: ServiceList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.SERVICE',
        permissions: ['service.read'],
        permissionMode: 'any'
      }
  
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceRoutingModule { }
