import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InsideAndDecorPartRoutingModule } from './inside-and-decor-part-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { InsideAndDecorPartList } from './inside-and-decor-part-list/inside-and-decor-part-list';


@NgModule({
  declarations: [InsideAndDecorPartList],
  imports: [
    CommonModule,
    InsideAndDecorPartRoutingModule,
    SharedModule
  ]
})
export class InsideAndDecorPartModule { }
