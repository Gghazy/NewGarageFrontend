import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-crane-list',
  standalone: false,
  templateUrl: './crane-list.html',
  styleUrl: './crane-list.css',
})
export class CraneList {
  config: LookupConfig = {
    apiBase: 'Cranes',
    titleKey: 'CRANES.TITLE',
    addTitleKey: 'CRANES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'crane.read',
    permCreate: 'crane.create',
    permUpdate: 'crane.update',
    permDelete: 'crane.delete',
    nameArKey: 'CRANES.TABLE.NAME_AR',
    nameEnKey: 'CRANES.TABLE.NAME_EN',
  };
}
