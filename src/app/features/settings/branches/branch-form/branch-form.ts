import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { Observable } from 'rxjs';

export interface BranchFormValue {
  id?: number;
  nameAr: string;
  nameEn: string;
}

@Component({
  selector: 'app-branch-form',
  standalone: false,
  templateUrl: './branch-form.html',
  styleUrl: './branch-form.css',
})
export class BranchForm implements OnInit, OnDestroy {
  @Input() title = 'Add Branch';
  @Input() initial?: Partial<BranchFormValue>;

  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [0],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
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
        id: this.initial.id ?? 0,
        nameAr: this.initial.nameAr ?? '',
        nameEn: this.initial.nameEn ?? '',
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: BranchFormValue = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
    };

    const isEdit = !!value.id;
    const apiCall: Observable<unknown> = isEdit
      ? this.apiService.put(`branches/${value.id}`, value)
      : this.apiService.post('branches', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)), {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Branch updated successfully' : 'Branch created successfully',
      errorFallback: isEdit ? 'Failed to update branch' : 'Failed to create branch',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
