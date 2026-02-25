import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleOrderForm } from './vehicle-order-form/vehicle-order-form';
import { VehicleOrderList } from './vehicle-order-list/vehicle-order-list';

const routes: Routes = [
  { path: '', component: VehicleOrderList },
  { path: 'new', component: VehicleOrderForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleOrdersRoutingModule {}
