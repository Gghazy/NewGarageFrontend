import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleOrderForm } from './vehicle-order-form/vehicle-order-form';
import { VehicleOrderList } from './vehicle-order-list/vehicle-order-list';
import { VehicleOrdersLayout } from './vehicle-orders-layout';

const routes: Routes = [
  {
    path: '',
    component: VehicleOrdersLayout,
    data: { breadcrumb: 'BREADCRUMB.EXAMINATIONS' },
    children: [
      {
        path: '',
        component: VehicleOrderList,
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        component: VehicleOrderForm,
        data: { breadcrumb: 'BREADCRUMB.NEW_EXAMINATION' }
      },
      {
        path: ':id',
        component: VehicleOrderForm,
        data: { breadcrumb: 'BREADCRUMB.EDIT_EXAMINATION' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleOrdersRoutingModule {}
