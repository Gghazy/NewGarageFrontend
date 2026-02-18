import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { TermDto } from 'src/app/shared/Models/terms/term-dto';

@Component({
  selector: 'app-temr-form',
  standalone: false,
  templateUrl: './temr-form.html',
  styleUrl: './temr-form.css',
})
export class TemrForm {

  data?: TermDto;

  form = this.fb.group({
    id: [null as string | null],
    termsAndCondtionsAr: ['', [Validators.required]],
    termsAndCondtionsEn: ['', [Validators.required]],
    cancelWarrantyDocumentAr: ['', [Validators.required]],
    cancelWarrantyDocumentEn: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    public apiService: ApiService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getTerm();
  }
  getTerm() {
    this.apiService.get<TermDto>(`terms`).subscribe(res => {
      
      this.data = res;
      this.form.patchValue(res);
    });
  }
  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[controlName];
    return !!(c.invalid && (c.touched || c.dirty));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: TermDto = {
      termsAndCondtionsAr: this.form.value.termsAndCondtionsAr!,
      termsAndCondtionsEn: this.form.value.termsAndCondtionsEn!,
      cancelWarrantyDocumentAr: this.form.value.cancelWarrantyDocumentAr!,
      cancelWarrantyDocumentEn: this.form.value.cancelWarrantyDocumentEn!,
      id: this.form.value.id!,
    };
    if (value.id) {
      this.update(value);
    } else {
      this.add(value);
    }
  }

  add(request: TermDto) {
    this.apiService.post('Terms', request).subscribe(() => {
      this.toastr.success('Term added successfully', 'Success');
    });
  }
  update(request: TermDto) {
    this.apiService.put(`Terms/${request.id}`, request).subscribe((res: any) => {

      this.toastr.success(res.message as string, 'Success');
    });
  }
}
