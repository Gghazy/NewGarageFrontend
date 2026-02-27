import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MechPartsRoutingModule } from './mech-parts-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { MechPartList } from './mech-part-list/mech-part-list';
import { MechPartForm } from './mech-part-form/mech-part-form';


@NgModule({
  declarations: [MechPartList,MechPartForm],
  imports: [
    CommonModule,
    MechPartsRoutingModule,
    SharedModule
  ]
})
export class MechPartsModule { }
