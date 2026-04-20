import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { ServicePointRuleDto } from 'src/app/shared/Models/servicePointRule/service-point-rule-dto';
import { ServicePointRuleRequest } from 'src/app/shared/Models/servicePointRule/service-point-rule-request';

@Component({
  selector: 'app-service-point-rule-form',
  standalone: false,
  templateUrl: './service-point-rule-form.html',
  styleUrl: './service-point-rule-form.css',
})
export class ServicePointRuleForm implements OnInit, OnDestroy {
  @Input() title = 'Add Point Rule';
  @Input() rule?: ServicePointRuleDto;
  @Input() ruleId?: string;

  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    fromAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    toAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    points: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    isActive: [true],
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    if (this.rule) {
      this.form.patchValue({
        fromAmount: this.rule.fromAmount,
        toAmount: this.rule.toAmount,
        points: this.rule.points,
        isActive: this.rule.isActive,
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: ServicePointRuleRequest = {
      id: this.ruleId,
      fromAmount: this.form.value.fromAmount!,
      toAmount: this.form.value.toAmount!,
      points: this.form.value.points!,
      isActive: this.form.value.isActive!,
    };

    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`ServicePointRules/${value.id}`, value)
      : this.apiService.post('ServicePointRules', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Point rule updated successfully' : 'Point rule created successfully',
      errorFallback: isEdit ? 'Failed to update point rule' : 'Failed to create point rule',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
