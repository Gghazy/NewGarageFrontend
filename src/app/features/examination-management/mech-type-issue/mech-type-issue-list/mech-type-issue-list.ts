import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-mech-type-issue-list',
  standalone:false,
  templateUrl: './mech-type-issue-list.html',
  styleUrl: './mech-type-issue-list.css',
})
export class MechTypeIssueList {
 config: LookupConfig = {
    apiBase: 'MechIssueTypes',
    titleKey: 'MECH_TYPE_ISSUES.TITLE',
    addTitleKey: 'MECH_TYPE_ISSUES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'mechIssueType.read',
    permCreate: 'mechIssueType.create',
    permUpdate: 'mechIssueType.update',
    permDelete: 'mechIssueType.delete',
    nameArKey: 'MECH_TYPE_ISSUES.TABLE.NAME_AR',
    nameEnKey: 'MECH_TYPE_ISSUES.TABLE.NAME_EN',
  };
}
