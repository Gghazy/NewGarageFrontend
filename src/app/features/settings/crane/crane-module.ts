import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CraneRoutingModule } from './crane-routing-module';
import { CraneList } from './crane-list/crane-list';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [CraneList],
  imports: [
    CommonModule,
    CraneRoutingModule,
    SharedModule
  ]
})
export class CraneModule { }
