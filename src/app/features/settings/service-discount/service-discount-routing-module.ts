import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceDiscountList } from './service-discount-list/service-discount-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: ServiceDiscountList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.SERVICE_DISCOUNT',
      permissions: ['serviceDiscount.read'],
      permissionMode: 'any'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceDiscountRoutingModule { }
