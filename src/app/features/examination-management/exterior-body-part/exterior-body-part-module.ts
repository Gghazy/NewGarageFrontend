import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExteriorBodyPartRoutingModule } from './exterior-body-part-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { ExteriorBodyPartList } from './exterior-body-part-list/exterior-body-part-list';

@NgModule({
  declarations: [ExteriorBodyPartList],
  imports: [CommonModule, ExteriorBodyPartRoutingModule, SharedModule]
})
export class ExteriorBodyPartModule { }
