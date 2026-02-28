import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { WorkflowDataService } from './workflow-data.service';

@Component({
  selector: 'app-examination-workflow-layout',
  templateUrl: './examination-workflow-layout.html',
  styleUrls: ['./examination-workflow.css'],
  standalone: false,
})
export class ExaminationWorkflowLayout implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthService,
    public workflowData: WorkflowDataService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    const id = this.resolveExaminationId();
    if (!id) {
      this.router.navigate(['/features/vehicle-orders']);
      return;
    }

    this.workflowData.readOnly = !this.authService.hasPermission('examination.update');

    this.workflowData.loadWorkflow(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.workflowData.stages.length > 0 && !this.route.children.length) {
            this.router.navigate(
              [this.workflowData.stages[0].nameEn],
              { relativeTo: this.route, replaceUrl: true },
            );
          }
        },
        error: () => {
          this.router.navigate(['/features/vehicle-orders']);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.workflowData.reset();
  }

  goBack(): void {
    const id = this.resolveExaminationId();
    if (id) {
      this.router.navigate(['/features/vehicle-orders', id, 'details']);
    } else {
      this.router.navigate(['/features/vehicle-orders']);
    }
  }

  private resolveExaminationId(): string | null {
    let r: ActivatedRoute | null = this.route;
    while (r) {
      const id = r.snapshot.paramMap.get('id');
      if (id) return id;
      r = r.parent;
    }
    return null;
  }

  get examTypeKey(): string {
    const map: Record<string, string> = {
      Regular: 'TYPE_REGULAR',
      Warranty: 'TYPE_WARRANTY',
      PrePurchase: 'TYPE_PRE_PURCHASE',
    };
    return 'VEHICLE_ORDERS.FORM.' + (map[this.workflowData.exam?.type ?? ''] ?? 'TYPE_REGULAR');
  }
}
