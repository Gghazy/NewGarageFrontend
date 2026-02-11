import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-interior-body-issue-list',
  standalone: false,
  templateUrl: './interior-body-issue-list.html',
  styleUrl: './interior-body-issue-list.css',
})
export class InteriorBodyIssueList {
  config: LookupConfig = {
    apiBase: 'InteriorBodyIssues',
    titleKey: 'INTERIOR_BODY_ISSUES.TITLE',
    addTitleKey: 'INTERIOR_BODY_ISSUES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'interiorBodyIssue.read',
    permCreate: 'interiorBodyIssue.create',
    permUpdate: 'interiorBodyIssue.update',
    nameArKey: 'INTERIOR_BODY_ISSUES.TABLE.NAME_AR',
    nameEnKey: 'INTERIOR_BODY_ISSUES.TABLE.NAME_EN',
  };
}
