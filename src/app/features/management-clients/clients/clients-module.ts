import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ClientsRoutingModule } from './clients-routing-module';
import { ClientList } from './client-list/client-list';
import { ClientForm } from './client-form/client-form';
import { ClientIndividualForm } from './client-individual-form/client-individual-form';
import { ClientCompanyForm } from './client-company-form/client-company-form';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [
    ClientList,
    ClientForm,
    ClientIndividualForm,
    ClientCompanyForm
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    ClientsRoutingModule
  ]
})
export class ClientsModule { }
