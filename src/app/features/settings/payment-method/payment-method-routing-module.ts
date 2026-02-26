import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentMethodList } from './payment-method-list/payment-method-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: PaymentMethodList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.PAYMENT_METHODS',
      permissions: ['paymentMethod.read'],
      permissionMode: 'any'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentMethodRoutingModule { }
