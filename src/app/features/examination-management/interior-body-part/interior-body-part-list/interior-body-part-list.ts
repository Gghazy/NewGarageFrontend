import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-interior-body-part-list',
  standalone: false,
  templateUrl: './interior-body-part-list.html',
  styleUrl: './interior-body-part-list.css',
})
export class InteriorBodyPartList {
  config: LookupConfig = {
    apiBase: 'InteriorBodyParts',
    titleKey: 'INTERIOR_BODY_PART.TITLE',
    addTitleKey: 'INTERIOR_BODY_PART.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'interiorBodyPart.read',
    permCreate: 'interiorBodyPart.create',
    permUpdate: 'interiorBodyPart.update',
    permDelete: 'interiorBodyPart.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
