import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-accessory-part-list',
  standalone: false,
  templateUrl: './accessory-part-list.html',
  styleUrl: './accessory-part-list.css',
})
export class AccessoryPartList {
  config: LookupConfig = {
    apiBase: 'AccessoryParts',
    titleKey: 'ACCESSORY_PART.TITLE',
    addTitleKey: 'ACCESSORY_PART.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'accessoryPart.read',
    permCreate: 'accessoryPart.create',
    permUpdate: 'accessoryPart.update',
    permDelete: 'accessoryPart.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
