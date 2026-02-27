import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteriorBodyPartRoutingModule } from './interior-body-part-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { InteriorBodyPartList } from './interior-body-part-list/interior-body-part-list';

@NgModule({
  declarations: [InteriorBodyPartList],
  imports: [CommonModule, InteriorBodyPartRoutingModule, SharedModule]
})
export class InteriorBodyPartModule { }
