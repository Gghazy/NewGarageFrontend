import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';
import { RoadTestIssueDto } from 'src/app/shared/Models/road-test-issues/road-test-issue-dto';

@Component({
  selector: 'app-road-test-issue-form',
  standalone: false,
  templateUrl: './road-test-issue-form.html',
  styleUrl: './road-test-issue-form.css',
})
export class RoadTestIssueForm implements OnInit, OnDestroy {
  @Input() title = 'Add Road Test Issue';
  @Input() initial?: Partial<RoadTestIssueDto>;

  roadTestIssueTypes: LookupDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [''],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
    roadTestIssueTypeId: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    if (this.initial) {
      this.form.patchValue({
        id: this.initial.id ?? '',
        nameAr: this.initial.nameAr ?? '',
        nameEn: this.initial.nameEn ?? '',
        roadTestIssueTypeId: this.initial.roadTestIssueTypeId ?? '',
      });
    }
    this.getRoadTestIssueTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  getRoadTestIssueTypes() {
    this.apiService.get<ApiResponse<LookupDto[]>>('RoadTestIssueTypes')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.roadTestIssueTypes = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load road test issue types'), 'Error'); }
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: RoadTestIssueDto = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
      roadTestIssueTypeId: this.form.value.roadTestIssueTypeId!,
    };

    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`RoadTestIssues/${value.id}`, value)
      : this.apiService.post('RoadTestIssues', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Road test issue updated successfully' : 'Road test issue created successfully',
      errorFallback: isEdit ? 'Failed to update road test issue' : 'Failed to create road test issue',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
