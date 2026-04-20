import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceDiscountRoutingModule } from './service-discount-routing-module';
import { ServiceDiscountList } from './service-discount-list/service-discount-list';
import { SharedModule } from 'src/app/shared/shared-module';
import { ServiceDiscountForm } from './service-discount-form/service-discount-form';

@NgModule({
  declarations: [ServiceDiscountList, ServiceDiscountForm],
  imports: [
    CommonModule,
    ServiceDiscountRoutingModule,
    SharedModule
  ]
})
export class ServiceDiscountModule { }
