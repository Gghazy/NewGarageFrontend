import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-payment-method-list',
  standalone: false,
  templateUrl: './payment-method-list.html',
  styleUrl: './payment-method-list.css',
})
export class PaymentMethodList {
  config: LookupConfig = {
    apiBase: 'PaymentMethods',
    titleKey: 'PAYMENT_METHODS.TITLE',
    addTitleKey: 'PAYMENT_METHODS.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'paymentMethod.read',
    permCreate: 'paymentMethod.create',
    permUpdate: 'paymentMethod.update',
    permDelete: 'paymentMethod.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
