import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
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
export class ServiceForm {
  @Input() title = 'Add Service';
  @Input() serviceId?: string;

  stages: StageDto[] = [];

  loading = false;

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
      this.apiService.get<ServiceDto>(`Services/${this.serviceId}`).subscribe({
        next: (data) => {
          
          this.form.patchValue({
            id: data.id ?? '',
            nameAr: data.nameAr ?? '',
            nameEn: data.nameEn ?? '',
            stages: data.stages.map((s: any) => s.id) ?? [],
          });
        },
        error: (err) => {
          console.error('Error loading service', err);
        }
      });
    }
    this.getStages();
  }
  getStages() {
    this.apiService.get<StageDto[]>('services/stages').subscribe({
      next: (data) => {
        this.stages = data;
      },
      error: (err) => {
        console.error('Error loading mech issue types', err);
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
    this.apiService.post('Services', request).subscribe(() => {
      this.activeModal.close(request);
    });
  }
  update(request: ServiceDto) {
    this.apiService.put(`Services/${request.id}`, request).subscribe((res: any) => {

      this.toastr.success(res.message as string, 'Success');
      this.activeModal.close(request);
    });
  }
}
