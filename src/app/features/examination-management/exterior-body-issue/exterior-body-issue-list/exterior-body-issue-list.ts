import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-exterior-body-issue-list',
  standalone:false,
  templateUrl: './exterior-body-issue-list.html',
  styleUrl: './exterior-body-issue-list.css',
})
export class ExteriorBodyIssueList {
  config: LookupConfig = {
    apiBase: 'ExteriorBodyIssues',
    titleKey: 'EXTERIOR_BODY_ISSUES.TITLE',
    addTitleKey: 'EXTERIOR_BODY_ISSUES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'exteriorBodyIssue.read',
    permCreate: 'exteriorBodyIssue.create',
    permUpdate: 'exteriorBodyIssue.update',
    permDelete: 'exteriorBodyIssue.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
