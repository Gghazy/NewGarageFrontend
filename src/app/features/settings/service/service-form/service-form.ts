import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { ServiceDto } from 'src/app/shared/Models/service/service-dto';
import { StageDto } from 'src/app/shared/Models/service/stage-dto';

@Component({
  selector: 'app-service-form',
  standalone: false,
  templateUrl: './service-form.html',
  styleUrl: './service-form.css',
})
export class ServiceForm implements OnInit, OnDestroy {
  @Input() title = 'Add Service';
  @Input() serviceId?: string;

  stages: StageDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [''],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
    stages: this.fb.control<number[]>([], Validators.required),
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private formService: FormService
  ) { }

  ngOnInit(): void {
    if (this.serviceId) {
      // GET /{id} returns ApiResponse<ServiceDto> -> { data: {...}, message: null }
      this.apiService.get<ApiResponse<ServiceDto>>(`Services/${this.serviceId}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            const data = res.data;
            this.form.patchValue({
              id: data.id ?? '',
              nameAr: data.nameAr ?? '',
              nameEn: data.nameEn ?? '',
              stages: data.stages?.map((s: any) => s.id) ?? [],
            });
          },
          error: (err) => {
            this.toastr.error(this.formService.extractError(err, 'Failed to load service'), 'Error');
          }
        });
    }
    this.getStages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  getStages() {
    // GET /stages returns ApiResponse<Stage[]> -> { data: [...] }
    this.apiService.get<ApiResponse<StageDto[]>>('services/stages')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.stages = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load stages'), 'Error'); }
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: ServiceDto = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
      stages: this.form.value.stages!,
    };

    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`Services/${value.id}`, value)
      : this.apiService.post('Services', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Service updated successfully' : 'Service created successfully',
      errorFallback: isEdit ? 'Failed to update service' : 'Failed to create service',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }
}
