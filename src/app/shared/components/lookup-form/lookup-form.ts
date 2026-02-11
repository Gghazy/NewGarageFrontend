import { Component, Input } from '@angular/core';
import { LookupDto } from '../../Models/lookup-dto';
import { FormBuilder, Validators } from '@angular/forms';
import { LookupConfig } from '../../Models/lookup-config';
import { ApiService } from 'src/app/core/services/custom.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lookup-form',
  standalone: false,
  templateUrl: './lookup-form.html',
  styleUrl: './lookup-form.css',
})
export class LookupForm {
  @Input() title = 'Add';
  @Input({ required: true }) config!: LookupConfig;
  @Input() initial?: Partial<LookupDto>;

  loading = false;

  form = this.fb.group({
    id: [''],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
  });

  constructor(
    private fb: FormBuilder,
    public apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.initial) {
      this.form.patchValue({
        id: this.initial.id ?? '',
        nameAr: this.initial.nameAr ?? '',
        nameEn: this.initial.nameEn ?? '',
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const value: LookupDto = {
      id: this.form.value.id!,
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
    };

    if (value.id) this.update(value);
    else this.add(value);
  }

  add(request: LookupDto) {
    this.apiService.post(`${this.config.apiBase}`, request).subscribe(() => {
      this.activeModal.close(request);
    });
  }

  update(request: LookupDto) {
    this.apiService.put(`${this.config.apiBase}/${request.id}`, request).subscribe((res: any) => {
      this.toastr.success(res?.message ?? 'Updated', 'Success');
      this.activeModal.close(request);
    });
  }
}
