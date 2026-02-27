import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsideAndDecorPartIssueRoutingModule } from './inside-and-decor-part-issue-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { InsideAndDecorPartIssueList } from './inside-and-decor-part-issue-list/inside-and-decor-part-issue-list';

@NgModule({
  declarations: [InsideAndDecorPartIssueList],
  imports: [CommonModule, InsideAndDecorPartIssueRoutingModule, SharedModule]
})
export class InsideAndDecorPartIssueModule { }
