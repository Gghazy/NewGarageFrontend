import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MechIssueRoutingModule } from './mech-issue-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { MechIssueList } from './mech-issue-list/mech-issue-list';

@NgModule({
  declarations: [MechIssueList],
  imports: [CommonModule, SharedModule, MechIssueRoutingModule],
})
export class MechIssueModule {}
