import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExteriorBodyIssueRoutingModule } from './exterior-body-issue-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { ExteriorBodyIssueList } from './exterior-body-issue-list/exterior-body-issue-list';


@NgModule({
  declarations: [ExteriorBodyIssueList],
  imports: [
    CommonModule,
    ExteriorBodyIssueRoutingModule,
    SharedModule
  ]
})
export class ExteriorBodyIssueModule { }
