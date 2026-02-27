import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-exam-stats',
  templateUrl: './exam-stats.html',
  styleUrls: ['../dashboard.css'],
  standalone: false,
})
export class ExamStatsComponent {
  @Input() pending = 0;
  @Input() inProgress = 0;
  @Input() completed = 0;
}
