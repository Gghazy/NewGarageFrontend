import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-exterior-body-part-list',
  standalone: false,
  templateUrl: './exterior-body-part-list.html',
  styleUrl: './exterior-body-part-list.css',
})
export class ExteriorBodyPartList {
  config: LookupConfig = {
    apiBase: 'ExteriorBodyParts',
    titleKey: 'EXTERIOR_BODY_PART.TITLE',
    addTitleKey: 'EXTERIOR_BODY_PART.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'exteriorBodyPart.read',
    permCreate: 'exteriorBodyPart.create',
    permUpdate: 'exteriorBodyPart.update',
    permDelete: 'exteriorBodyPart.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
