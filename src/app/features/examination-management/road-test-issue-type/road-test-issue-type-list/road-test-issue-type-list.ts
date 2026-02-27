import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-road-test-issue-type-list',
  standalone: false,
  templateUrl: './road-test-issue-type-list.html',
  styleUrl: './road-test-issue-type-list.css',
})
export class RoadTestIssueTypeList {
  config: LookupConfig = {
    apiBase: 'RoadTestIssueTypes',
    titleKey: 'ROAD_TEST_ISSUE_TYPES.TITLE',
    addTitleKey: 'ROAD_TEST_ISSUE_TYPES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'roadTestIssueType.read',
    permCreate: 'roadTestIssueType.create',
    permUpdate: 'roadTestIssueType.update',
    permDelete: 'roadTestIssueType.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
