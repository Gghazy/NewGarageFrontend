import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-car-mark-list',
  standalone: false,
  templateUrl: './car-mark-list.html',
  styleUrl: './car-mark-list.css',
})
export class CarMarkList {
  config: LookupConfig = {
    apiBase: 'CarMarkes',
    titleKey: 'CAR_MARKS.TITLE',
    addTitleKey: 'CAR_MARKS.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'carMark.read',
    permCreate: 'carMark.create',
    permUpdate: 'carMark.update',
    permDelete: 'carMark.delete',
    nameArKey: 'CAR_MARKS.TABLE.NAME_AR',
    nameEnKey: 'CAR_MARKS.TABLE.NAME_EN',
  };
}
