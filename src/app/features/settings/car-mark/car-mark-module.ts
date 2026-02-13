import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarMarkRoutingModule } from './car-mark-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { CarMarkList } from './car-mark-list/car-mark-list';


@NgModule({
  declarations: [CarMarkList],
  imports: [
    CommonModule,
    CarMarkRoutingModule,
    SharedModule
  ]
})
export class CarMarkModule { }
