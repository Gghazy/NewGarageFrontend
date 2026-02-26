import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentMethodRoutingModule } from './payment-method-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { PaymentMethodList } from './payment-method-list/payment-method-list';

@NgModule({
  declarations: [PaymentMethodList],
  imports: [
    CommonModule,
    PaymentMethodRoutingModule,
    SharedModule
  ]
})
export class PaymentMethodModule { }
