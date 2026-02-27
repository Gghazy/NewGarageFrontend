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
import { MechPartDto } from 'src/app/shared/Models/mech-parts/mech-part-dto';

@Component({
  selector: 'app-mech-part-form',
  standalone: false,
  templateUrl: './mech-part-form.html',
  styleUrl: './mech-part-form.css',
})
export class MechPartForm implements OnInit, OnDestroy {
  @Input() title = 'Add Mech Part';
  @Input() initial?: Partial<MechPartDto>;

  mechPartTypes: LookupDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [''],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
    mechPartTypeId: ['', [Validators.required]],
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
        mechPartTypeId: this.initial.mechPartTypeId ?? '',
      });
    }
    this.getMechPartTypes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  getMechPartTypes() {
    this.apiService.get<ApiResponse<LookupDto[]>>('MechPartTypes')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.mechPartTypes = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load mech part types'), 'Error'); }
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: MechPartDto = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
      mechPartTypeId: this.form.value.mechPartTypeId!,
    };

    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`MechParts/${value.id}`, value)
      : this.apiService.post('MechParts', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Mech part updated successfully' : 'Mech part created successfully',
      errorFallback: isEdit ? 'Failed to update mech part' : 'Failed to create mech part',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
