import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { FeaturesRoutingModule } from './features-routing-module';
import { FeaturesHome } from './home/features-home';
import { FeaturesComponent } from './features.component';

@NgModule({
  declarations: [FeaturesHome,FeaturesComponent],
  imports: [SharedModule, FeaturesRoutingModule],
})
export class FeaturesModule {}
