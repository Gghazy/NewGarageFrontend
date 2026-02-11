import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxPaginationModule } from 'ngx-pagination';

import { Footer } from './components/footer/footer';
import { Breadcrumb } from './components/breadcrumb/breadcrumb';
import { Topbar } from './components/topbar/topbar';
import { PageSizeComponent } from './components/page-size/page-size.component';
import { LookupList } from './components/lookup-list/lookup-list';
import { LookupForm } from './components/lookup-form/lookup-form';
import { SharedList } from './components/shared-list/shared-list';
import { NgSelectModule } from '@ng-select/ng-select';


const COMPONENTS = [
  Footer,
  Breadcrumb,
  Topbar,
  PageSizeComponent,
  LookupList,
  LookupForm,
  SharedList
];

const MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  TranslateModule,
  NgxPaginationModule,
  NgSelectModule
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [...MODULES],
  exports: [...COMPONENTS, ...MODULES],
})
export class SharedModule {}
