import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccessoryIssueRoutingModule } from './accessory-issue-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { AccessoryIssueList } from './accessory-issue-list/accessory-issue-list';


@NgModule({
  declarations: [AccessoryIssueList],
  imports: [
    CommonModule,
    AccessoryIssueRoutingModule,
    SharedModule
  ]
})
export class AccessoryIssueModule { }
