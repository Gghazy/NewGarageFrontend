import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';

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
export class BranchForm implements OnInit {
  @Input() title = 'Add Branch';
  @Input() initial?: Partial<BranchFormValue>;

  loading = false;

  form = this.fb.group({
    id: [0],
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
        id: this.initial.id ?? 0,
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

    const value: BranchFormValue = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
    };
    
    if (value.id) {
      this.update(value);
    } else {
      this.add(value);
    }
  }
  add(request: BranchFormValue) {
    this.apiService.post('branches', request).subscribe(() => {
      this.activeModal.close(request);
    });
  }
  update(request: BranchFormValue) {
    this.apiService.put(`branches/${request.id}`, request).subscribe((res :any) => {
      
      this.toastr.success(res.message as string, 'Success');
      this.activeModal.close(request);
    });
  }
}
