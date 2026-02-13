import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TermsRoutingModule } from './terms-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { TemrForm } from './temr-form/temr-form';


@NgModule({
  declarations: [TemrForm],
  imports: [
    CommonModule,
    TermsRoutingModule,
    SharedModule
  ]
})
export class TermsModule { }
