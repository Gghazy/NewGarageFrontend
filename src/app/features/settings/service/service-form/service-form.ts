import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';
import { MechIssueDto } from 'src/app/shared/Models/mech-issues/mech-issue-dto';
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
    public apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
      
    if (this.serviceId) {
      this.apiService.get<ServiceDto>(`Services/${this.serviceId}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.form.patchValue({
              id: data.id ?? '',
              nameAr: data.nameAr ?? '',
              nameEn: data.nameEn ?? '',
              stages: data.stages.map((s: any) => s.id) ?? [],
            });
          },
          error: (err) => {
            console.error('[ServiceForm] Failed to load service:', err);
            this.toastr.error('Failed to load service', 'Error');
          }
        });
    }
    this.getStages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  getStages() {
    this.apiService.get<StageDto[]>('services/stages')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stages = data;
        },
        error: (err) => {
          console.error('[ServiceForm] Failed to load stages:', err);
          this.toastr.error('Failed to load stages', 'Error');
        }
      });
  }
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const value: ServiceDto = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
      stages: this.form.value.stages!,
    };

    if (value.id) {
      this.update(value);
    } else {
      this.add(value);
    }
  }
  add(request: ServiceDto) {
    this.apiService.post('Services', request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Service created successfully', 'Success');
          this.activeModal.close(request);
        },
        error: (err) => {
          console.error('[ServiceForm] Failed to create service:', err);
          this.toastr.error(err?.error?.message ?? 'Failed to create service', 'Error');
          this.loading = false;
        }
      });
  }

  update(request: ServiceDto) {
    this.apiService.put(`Services/${request.id}`, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.toastr.success(res.message ?? 'Service updated successfully', 'Success');
          this.activeModal.close(request);
        },
        error: (err) => {
          console.error('[ServiceForm] Failed to update service:', err);
          this.toastr.error(err?.error?.message ?? 'Failed to update service', 'Error');
          this.loading = false;
        }
      });
  }
}
