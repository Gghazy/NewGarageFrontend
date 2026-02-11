import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';

@Component({
  selector: 'app-sensor-issue-form',
  standalone: false,
  templateUrl: './sensor-issues-form.html',
})
export class SensorIssuesForm {
  @Input() title = '';
  @Input() model: any | null = null; 

  loading = false;

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
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.model) {
      this.form.patchValue({
        id: this.model.id ?? 0,
        code: this.model.code ?? '',
        nameAr: this.model.nameAr ?? '',
        nameEn: this.model.nameEn ?? '',
      });
    }
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

    this.loading = true;

    const dto = this.form.getRawValue();
    const req$ = dto.id
      ? this.api.put(`SensorIssues/${dto.id}`, dto)
      : this.api.post(`SensorIssues`, dto);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.activeModal.close(true);
      },
      error: () => {
        this.loading = false;
        this.activeModal.dismiss();
      }
    });
  }
}
