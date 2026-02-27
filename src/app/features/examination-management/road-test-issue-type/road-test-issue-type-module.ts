import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoadTestIssueTypeRoutingModule } from './road-test-issue-type-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { RoadTestIssueTypeList } from './road-test-issue-type-list/road-test-issue-type-list';

@NgModule({
  declarations: [RoadTestIssueTypeList],
  imports: [CommonModule, RoadTestIssueTypeRoutingModule, SharedModule]
})
export class RoadTestIssueTypeModule { }
