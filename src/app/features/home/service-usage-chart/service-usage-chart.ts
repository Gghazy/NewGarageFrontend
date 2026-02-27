import { Component, Input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-service-usage-chart',
  templateUrl: './service-usage-chart.html',
  styleUrls: ['../dashboard.css'],
  standalone: false,
})
export class ServiceUsageChartComponent {
  @Input() chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  @Input() chartOptions: ChartOptions<'bar'> = {};
}
