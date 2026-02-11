import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MechIssuesRoutingModule } from './mech-issues-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { MechIssueList } from './mech-issue-list/mech-issue-list';
import { MechIssueForm } from './mech-issue-form/mech-issue-form';


@NgModule({
  declarations: [MechIssueList,MechIssueForm],
  imports: [
    CommonModule,
    MechIssuesRoutingModule,
    SharedModule
  ]
})
export class MechIssuesModule { }
