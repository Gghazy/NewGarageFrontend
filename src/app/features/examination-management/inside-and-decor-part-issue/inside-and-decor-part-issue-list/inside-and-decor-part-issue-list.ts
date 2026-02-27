import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-inside-and-decor-part-issue-list',
  standalone: false,
  templateUrl: './inside-and-decor-part-issue-list.html',
  styleUrl: './inside-and-decor-part-issue-list.css',
})
export class InsideAndDecorPartIssueList {
  config: LookupConfig = {
    apiBase: 'InsideAndDecorPartIssues',
    titleKey: 'INSIDE_AND_DECOR_PART_ISSUE.TITLE',
    addTitleKey: 'INSIDE_AND_DECOR_PART_ISSUE.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'insideAndDecorPartIssue.read',
    permCreate: 'insideAndDecorPartIssue.create',
    permUpdate: 'insideAndDecorPartIssue.update',
    permDelete: 'insideAndDecorPartIssue.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
