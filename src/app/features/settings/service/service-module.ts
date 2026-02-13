import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceRoutingModule } from './service-routing-module';
import { ServiceList } from './service-list/service-list';
import { ServiceForm } from './service-form/service-form';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [ServiceList,ServiceForm],
  imports: [
    CommonModule,
    ServiceRoutingModule,
    SharedModule
  ]
})
export class ServiceModule { }
