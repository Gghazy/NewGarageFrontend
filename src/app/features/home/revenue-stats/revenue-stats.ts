import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-revenue-stats',
  templateUrl: './revenue-stats.html',
  styleUrls: ['../dashboard.css'],
  standalone: false,
})
export class RevenueStatsComponent {
  @Input() netRevenue = 0;
  @Input() totalDiscounts = 0;
  @Input() refundCount = 0;
  @Input() refundAmount = 0;
}
