import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface DashboardFilter {
  dateFrom: string;
  dateTo: string;
  branchId: string | null;
}

@Component({
  selector: 'app-dashboard-filter',
  templateUrl: './dashboard-filter.html',
  styleUrls: ['./dashboard-filter.css'],
  standalone: false,
})
export class DashboardFilterComponent {
  @Input() branches: { id: string; nameAr: string; nameEn: string }[] = [];
  @Input() isAr = false;
  @Output() filterChange = new EventEmitter<DashboardFilter>();

  dateFrom = '';
  dateTo = '';
  branchId: string | null = null;

  constructor() {
    const today = new Date().toISOString().slice(0, 10);
    this.dateFrom = today;
    this.dateTo = today;
  }

  onChanged(): void {
    this.filterChange.emit({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      branchId: this.branchId,
    });
  }
}
