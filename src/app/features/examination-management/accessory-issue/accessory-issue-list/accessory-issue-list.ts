import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-accessory-issue-list',
  standalone:false,
  templateUrl: './accessory-issue-list.html',
  styleUrl: './accessory-issue-list.css',
})
export class AccessoryIssueList {
 config: LookupConfig = {
    apiBase: 'AccessoryIssues',
    titleKey: 'ACCESSORY_ISSUES.TITLE',
    addTitleKey: 'ACCESSORY_ISSUES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'accessoryIssue.read',
    permCreate: 'accessoryIssue.create',
    permUpdate: 'accessoryIssue.update',
    nameArKey: 'ACCESSORY_ISSUES.TABLE.NAME_AR',
    nameEnKey: 'ACCESSORY_ISSUES.TABLE.NAME_EN',
  };
}
