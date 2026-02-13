import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicePriceList } from './service-price-list/service-price-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: ServicePriceList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.SERVICE_PRICE',
      permissions: ['servicePrice.read'],
      permissionMode: 'any'
    }

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicePriceRoutingModule { }
