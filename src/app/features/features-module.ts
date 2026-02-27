import { NgModule } from '@angular/core';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { SharedModule } from '../shared/shared-module';
import { FeaturesRoutingModule } from './features-routing-module';
import { FeaturesHome } from './home/features-home';
import { FeaturesComponent } from './features.component';
import { DashboardFilterComponent } from './home/dashboard-filter/dashboard-filter';
import { ExamStatsComponent } from './home/exam-stats/exam-stats';
import { RevenueStatsComponent } from './home/revenue-stats/revenue-stats';
import { ServiceUsageChartComponent } from './home/service-usage-chart/service-usage-chart';

@NgModule({
  declarations: [
    FeaturesHome,
    FeaturesComponent,
    DashboardFilterComponent,
    ExamStatsComponent,
    RevenueStatsComponent,
    ServiceUsageChartComponent,
  ],
  imports: [SharedModule, FeaturesRoutingModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class FeaturesModule {}
