import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicePointRuleRoutingModule } from './service-point-rule-routing-module';
import { ServicePointRuleList } from './service-point-rule-list/service-point-rule-list';
import { SharedModule } from 'src/app/shared/shared-module';
import { ServicePointRuleForm } from './service-point-rule-form/service-point-rule-form';

@NgModule({
  declarations: [ServicePointRuleList, ServicePointRuleForm],
  imports: [
    CommonModule,
    ServicePointRuleRoutingModule,
    SharedModule
  ]
})
export class ServicePointRuleModule { }
