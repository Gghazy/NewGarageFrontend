import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-mech-part-type-list',
  standalone:false,
  templateUrl: './mech-part-type-list.html',
  styleUrl: './mech-part-type-list.css',
})
export class MechPartTypeList {
 config: LookupConfig = {
    apiBase: 'MechPartTypes',
    titleKey: 'MECH_PART_TYPES.TITLE',
    addTitleKey: 'MECH_PART_TYPES.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'mechPartType.read',
    permCreate: 'mechPartType.create',
    permUpdate: 'mechPartType.update',
    permDelete: 'mechPartType.delete',
    nameArKey: 'COMMON.NAME_AR',
    nameEnKey: 'COMMON.NAME_EN',
  };
}
