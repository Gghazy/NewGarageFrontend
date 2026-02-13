import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicePriceRoutingModule } from './service-price-routing-module';
import { ServicePriceList } from './service-price-list/service-price-list';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [ServicePriceList],
  imports: [
    CommonModule,
    ServicePriceRoutingModule,
    SharedModule
  ]
})
export class ServicePriceModule { }
