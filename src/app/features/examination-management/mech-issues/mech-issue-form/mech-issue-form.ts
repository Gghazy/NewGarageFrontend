import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';
import { MechIssueDto } from 'src/app/shared/Models/mech-issues/mech-issue-dto';

@Component({
  selector: 'app-mech-issue-form',
  standalone: false,
  templateUrl: './mech-issue-form.html',
  styleUrl: './mech-issue-form.css',
})
export class MechIssueForm {
  @Input() title = 'Add Mech Issue';
  @Input() initial?: Partial<MechIssueDto>;

  mechIssueTypes: LookupDto[] = [];
  loading = false;

  form = this.fb.group({
    id: [''],
    nameAr: ['', [Validators.required, Validators.maxLength(200)]],
    nameEn: ['', [Validators.required, Validators.maxLength(200)]],
    mechIssueTypeId: ['', [Validators.required, Validators.maxLength(200)]],
  });

  constructor(
    private fb: FormBuilder,
    public apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
   debugger
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
  getMechIssueTypes() {
    this.apiService.get<LookupDto[]>('MechIssueTypes').subscribe({
      next: (data) => {
        this.mechIssueTypes = data;
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

    const value: MechIssueDto = {
      nameAr: this.form.value.nameAr!,
      nameEn: this.form.value.nameEn!,
      id: this.form.value.id!,
      mechIssueTypeId: this.form.value.mechIssueTypeId!,
    };

    if (value.id) {
      this.update(value);
    } else {
      this.add(value);
    }
  }
  add(request: MechIssueDto) {
    this.apiService.post('MechIssues', request).subscribe(() => {
      this.activeModal.close(request);
    });
  }
  update(request: MechIssueDto) {
    this.apiService.put(`MechIssues/${request.id}`, request).subscribe((res: any) => {

      this.toastr.success(res.message as string, 'Success');
      this.activeModal.close(request);
    });
  }
}
