import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';

@Component({
  selector: 'app-sensor-issue-form',
  standalone: false,
  templateUrl: './sensor-issues-form.html',
})
export class SensorIssuesForm implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() model: any | null = null;

  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [null],
    code: ['', Validators.required],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    public readonly activeModal: NgbActiveModal,
    private readonly toastr: ToastrService,
    private readonly formService: FormService
  ) {}

  ngOnInit(): void {
    if (this.model) {
      this.form.patchValue({
        id: this.model.id ?? null,
        code: this.model.code ?? '',
        nameAr: this.model.nameAr ?? '',
        nameEn: this.model.nameEn ?? '',
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.touched && c.invalid);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.getRawValue();
    const isEdit = !!dto.id;
    const apiCall = isEdit
      ? this.api.put(`SensorIssues/${dto.id}`, dto)
      : this.api.post('SensorIssues', dto);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Sensor issue updated successfully' : 'Sensor issue created successfully',
      errorFallback: isEdit ? 'Failed to update sensor issue' : 'Failed to create sensor issue',
      setLoading: (v) => (this.loading = v),
    });
  }
}
