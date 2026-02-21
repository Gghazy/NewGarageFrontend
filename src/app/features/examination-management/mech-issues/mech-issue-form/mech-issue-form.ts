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
import { MechIssueDto } from 'src/app/shared/Models/mech-issues/mech-issue-dto';

@Component({
  selector: 'app-mech-issue-form',
  standalone: false,
  templateUrl: './mech-issue-form.html',
  styleUrl: './mech-issue-form.css',
})
export class MechIssueForm implements OnInit, OnDestroy {
  @Input() title = 'Add Mech Issue';
  @Input() initial?: Partial<MechIssueDto>;

  mechIssueTypes: LookupDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [''],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
    mechIssueTypeId: ['', [Validators.required]],
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
        mechIssueTypeId: this.initial.mechIssueTypeId ?? '',
      });
    }
    this.getMechIssueTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  getMechIssueTypes() {
    // MechIssueTypesController uses Success() -> { data: [...] }
    this.apiService.get<ApiResponse<LookupDto[]>>('MechIssueTypes')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.mechIssueTypes = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load mech issue types'), 'Error'); }
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: MechIssueDto = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
      mechIssueTypeId: this.form.value.mechIssueTypeId!,
    };

    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`MechIssues/${value.id}`, value)
      : this.apiService.post('MechIssues', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Mech issue updated successfully' : 'Mech issue created successfully',
      errorFallback: isEdit ? 'Failed to update mech issue' : 'Failed to create mech issue',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
