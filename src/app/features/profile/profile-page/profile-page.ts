import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormService } from 'src/app/core/services/form.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';

interface ProfileBranchDto {
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;
}

interface ProfileDto {
  nameAr: string;
  nameEn: string;
  email: string;
  phoneNumber: string;
  roleName: string;
  branches: ProfileBranchDto[];
}

interface UpdateProfileResponse {
  accessToken: string;
  expiresAt: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit, OnDestroy {
  loading = true;
  saving = false;
  changingPassword = false;

  roleName = '';
  branches: ProfileBranchDto[] = [];

  profileForm = this.fb.group({
    nameAr: ['', [Validators.required, Validators.minLength(2)]],
    nameEn: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private toastr: ToastrService,
    private formService: FormService,
    public lang: LanguageService
  ) {}

  get isAr(): boolean {
    return this.lang.lang() === 'ar';
  }

  get branchDisplay(): string {
    return this.branches
      .map(b => (this.isAr ? b.branchNameAr : b.branchNameEn))
      .join(', ');
  }

  get initials(): string {
    const name = (this.isAr
      ? this.profileForm.get('nameAr')?.value
      : this.profileForm.get('nameEn')?.value) || '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0]) return parts[0][0].toUpperCase();
    const email = this.profileForm.get('email')?.value || '';
    return email ? email[0].toUpperCase() : '?';
  }

  get displayName(): string {
    const name = this.isAr
      ? this.profileForm.get('nameAr')?.value
      : this.profileForm.get('nameEn')?.value;
    return name?.trim() || this.profileForm.get('email')?.value || '';
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.loading = true;
    this.api
      .get<ApiResponse<ProfileDto>>('Profile')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const p = res.data;
          this.profileForm.patchValue({
            nameAr: p.nameAr,
            nameEn: p.nameEn,
            email: p.email,
            phoneNumber: p.phoneNumber ?? '',
          });
          this.roleName = p.roleName;
          this.branches = p.branches;
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(
            this.formService.extractError(err, 'Failed to load profile'),
            'Error'
          );
          this.loading = false;
        },
      });
  }

  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.api
      .put<ApiResponse<UpdateProfileResponse>>('Profile', this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.data?.accessToken) {
            this.auth.setToken(res.data.accessToken);
          }
          this.toastr.success(
            res.message ?? 'Profile updated successfully',
            'Success'
          );
          this.saving = false;
        },
        error: (err) => {
          this.toastr.error(
            this.formService.extractError(err, 'Failed to update profile'),
            'Error'
          );
          this.saving = false;
        },
      });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.toastr.error('Passwords do not match', 'Error');
      return;
    }

    this.changingPassword = true;
    this.api
      .put<any>('Profile/change-password', this.passwordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.toastr.success(
            res?.message ?? 'Password changed successfully',
            'Success'
          );
          this.passwordForm.reset();
          this.changingPassword = false;
        },
        error: (err) => {
          this.toastr.error(
            this.formService.extractError(err, 'Failed to change password'),
            'Error'
          );
          this.changingPassword = false;
        },
      });
  }

  isInvalid(form: 'profile' | 'password', controlName: string): boolean {
    const c = form === 'profile'
      ? this.profileForm.get(controlName)
      : this.passwordForm.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
