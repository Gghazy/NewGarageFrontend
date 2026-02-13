import { Component } from '@angular/core';
import { LookupConfig } from 'src/app/shared/Models/lookup-config';

@Component({
  selector: 'app-inside-and-decor-part-list',
  standalone: false,
  templateUrl: './inside-and-decor-part-list.html',
  styleUrl: './inside-and-decor-part-list.css',
})
export class InsideAndDecorPartList {
  config: LookupConfig = {
    apiBase: 'InsideAndDecorParts',
    titleKey: 'INSIDE_AND_DECOR_PART.TITLE',
    addTitleKey: 'INSIDE_AND_DECOR_PART.ADD',
    editTitleKey: 'COMMON.EDIT',
    permRead: 'insideAndDecorPart.read',
    permCreate: 'insideAndDecorPart.create',
    permUpdate: 'insideAndDecorPart.update',
    nameArKey: 'INSIDE_AND_DECOR_PART.TABLE.NAME_AR',
    nameEnKey: 'INSIDE_AND_DECOR_PART.TABLE.NAME_EN',
  };
}


