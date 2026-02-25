import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared-module';
import { VehicleOrdersRoutingModule } from './vehicle-orders-routing-module';
import { VehicleOrderForm } from './vehicle-order-form/vehicle-order-form';
import { ClientSection } from './vehicle-order-form/client-section/client-section';
import { VehicleSection } from './vehicle-order-form/vehicle-section/vehicle-section';
import { ServicesSection } from './vehicle-order-form/services-section/services-section';
import { VehicleOrderList } from './vehicle-order-list/vehicle-order-list';

@NgModule({
  declarations: [
    VehicleOrderList,
    VehicleOrderForm,
    ClientSection,
    VehicleSection,
    ServicesSection,
  ],
  imports: [
    CommonModule,
    SharedModule,
    VehicleOrdersRoutingModule,
  ],
})
export class VehicleOrdersModule {}
