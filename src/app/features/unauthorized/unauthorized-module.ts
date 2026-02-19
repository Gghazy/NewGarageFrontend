import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UnauthorizedComponent } from './unauthorized';
import { UnauthorizedRoutingModule } from './unauthorized-routing-module';

@NgModule({
  declarations: [UnauthorizedComponent],
  imports: [CommonModule, UnauthorizedRoutingModule, TranslateModule],
})
export class UnauthorizedModule {}
