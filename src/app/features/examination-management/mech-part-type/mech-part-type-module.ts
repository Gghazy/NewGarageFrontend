import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MechPartTypeRoutingModule } from './mech-part-type-routing-module';
import { MechPartTypeList } from './mech-part-type-list/mech-part-type-list';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [MechPartTypeList],
  imports: [
    CommonModule,
    MechPartTypeRoutingModule,
    SharedModule
  ]
})
export class MechPartTypeModule { }
