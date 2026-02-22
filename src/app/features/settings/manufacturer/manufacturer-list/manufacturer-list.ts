import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-manufacturer-list',
  standalone: false,
  templateUrl: './manufacturer-list.html',
  styleUrl: './manufacturer-list.css',
})
export class ManufacturerList {
  config: LookupConfig = {
    apiBase: 'Manufacturers',
    titleKey: 'MANUFACTURERS.TITLE',
    addTitleKey: 'MANUFACTURERS.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'manufacturer.read',
    permCreate: 'manufacturer.create',
    permUpdate: 'manufacturer.update',
    permDelete: 'manufacturer.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
