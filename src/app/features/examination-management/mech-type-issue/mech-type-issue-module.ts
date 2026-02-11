import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MechTypeIssueRoutingModule } from './mech-type-issue-routing-module';
import { MechTypeIssueList } from './mech-type-issue-list/mech-type-issue-list';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [MechTypeIssueList],
  imports: [
    CommonModule,
    MechTypeIssueRoutingModule,
    SharedModule
  ]
})
export class MechTypeIssueModule { }
