import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AuthenticationRoutingModule } from './authentication-routing-module';

import { AuthenticationLayout } from './authentication';
import { Login } from './login/login';

@NgModule({
  declarations: [AuthenticationLayout, Login],
  imports: [SharedModule, AuthenticationRoutingModule],
})
export class AuthenticationModule {}
