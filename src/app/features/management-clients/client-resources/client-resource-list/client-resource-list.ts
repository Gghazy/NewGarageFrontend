import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-client-resource-list',
  standalone: false,
  templateUrl: './client-resource-list.html',
  styleUrl: './client-resource-list.css',
})
export class ClientResourceList {
  config: LookupConfig = {
    apiBase: 'ClientResources',
    titleKey: 'CLIENT_RESOURCES.TITLE',
    addTitleKey: 'CLIENT_RESOURCES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'clientResource.read',
    permCreate: 'clientResource.create',
    permUpdate: 'clientResource.update',
    permDelete: 'clientResource.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
