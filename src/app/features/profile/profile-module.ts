import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared-module';
import { ProfileRoutingModule } from './profile-routing-module';
import { ProfilePage } from './profile-page/profile-page';

@NgModule({
  declarations: [ProfilePage],
  imports: [SharedModule, ProfileRoutingModule],
})
export class ProfileModule {}
