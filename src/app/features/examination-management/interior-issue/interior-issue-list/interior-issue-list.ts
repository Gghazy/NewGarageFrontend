import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-interior-issue-list',
  standalone: false,
  templateUrl: './interior-issue-list.html',
  styleUrl: './interior-issue-list.css',
})
export class InteriorIssueList {
  config: LookupConfig = {
    apiBase: 'InteriorIssues',
    titleKey: 'INTERIOR_ISSUES.TITLE',
    addTitleKey: 'INTERIOR_ISSUES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'interiorIssue.read',
    permCreate: 'interiorIssue.create',
    permUpdate: 'interiorIssue.update',
    permDelete: 'interiorIssue.delete',
    nameArKey: 'INTERIOR_ISSUES.TABLE.NAME_AR',
    nameEnKey: 'INTERIOR_ISSUES.TABLE.NAME_EN',
  };
}
