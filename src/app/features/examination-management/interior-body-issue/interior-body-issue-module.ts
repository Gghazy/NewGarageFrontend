import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteriorBodyIssueRoutingModule } from './interior-body-issue-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { InteriorBodyIssueList } from './interior-body-issue-list/interior-body-issue-list';


@NgModule({
  declarations: [InteriorBodyIssueList],
  imports: [
    CommonModule,
    InteriorBodyIssueRoutingModule,
    SharedModule
  ]
})
export class InteriorBodyIssueModule { }
