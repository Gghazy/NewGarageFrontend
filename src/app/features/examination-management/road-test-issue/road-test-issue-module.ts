import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoadTestIssueRoutingModule } from './road-test-issue-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { RoadTestIssueList } from './road-test-issue-list/road-test-issue-list';
import { RoadTestIssueForm } from './road-test-issue-form/road-test-issue-form';

@NgModule({
  declarations: [RoadTestIssueList, RoadTestIssueForm],
  imports: [
    CommonModule,
    RoadTestIssueRoutingModule,
    SharedModule
  ]
})
export class RoadTestIssueModule { }
