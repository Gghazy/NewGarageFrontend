import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-mech-issue-list',
  standalone: false,
  templateUrl: './mech-issue-list.html',
  styleUrl: './mech-issue-list.css',
})
export class MechIssueList {
  config: LookupConfig = {
    apiBase: 'MechIssues',
    titleKey: 'MECH_ISSUES.TITLE',
    addTitleKey: 'MECH_ISSUES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'mechIssue.read',
    permCreate: 'mechIssue.create',
    permUpdate: 'mechIssue.update',
    permDelete: 'mechIssue.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
