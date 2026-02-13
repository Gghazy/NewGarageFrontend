import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManufacturerRoutingModule } from './manufacturer-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { ManufacturerList } from './manufacturer-list/manufacturer-list';


@NgModule({
  declarations: [ManufacturerList],
  imports: [
    CommonModule,
    ManufacturerRoutingModule,
    SharedModule
  ]
})
export class ManufacturerModule { }
