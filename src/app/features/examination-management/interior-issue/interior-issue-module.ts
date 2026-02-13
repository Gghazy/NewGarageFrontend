import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteriorIssueRoutingModule } from './interior-issue-routing-module';
import { InteriorIssueList } from './interior-issue-list/interior-issue-list';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [InteriorIssueList],
  imports: [
    CommonModule,
    InteriorIssueRoutingModule, 
    SharedModule
  ]
})
export class InteriorIssueModule { }
