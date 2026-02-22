import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-road-test-issue-list',
  standalone: false,
  templateUrl: './road-test-issue-list.html',
  styleUrl: './road-test-issue-list.css',
})
export class RoadTestIssueList {
  config: LookupConfig = {
    apiBase: 'RoadTestIssues',
    titleKey: 'ROAD_TEST_ISSUES.TITLE',
    addTitleKey: 'ROAD_TEST_ISSUES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'roadTestIssue.read',
    permCreate: 'roadTestIssue.create',
    permUpdate: 'roadTestIssue.update',
    permDelete: 'roadTestIssue.delete',
    nameArKey: 'ROAD_TEST_ISSUES.TABLE.NAME_AR',
    nameEnKey: 'ROAD_TEST_ISSUES.TABLE.NAME_EN',
  };
}
