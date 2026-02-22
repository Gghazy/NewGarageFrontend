import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { MechIssueForm } from '../mech-issue-form/mech-issue-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';
import { TranslateService } from '@ngx-translate/core';
import { MechIssueDto } from 'src/app/shared/Models/mech-issues/mech-issue-dto';

@Component({
  selector: 'app-mech-issue-list',
  standalone: false,
  templateUrl: './mech-issue-list.html',
  styleUrl: './mech-issue-list.css',
})
export class MechIssueList implements OnInit, OnDestroy {
  mechIssues: MechIssueDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'nameAr',
    desc: false,
    totalItems: 0
  };

  constructor(
    public apiService: ApiService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadMechIssues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMechIssues() {
    this.loading = true;
    this.apiService.post<any>('MechIssues/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.mechIssues = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading mech issues', err);
          this.toastr.error('Failed to load mech issues', 'Error');
          this.loading = false;
        }
      });
  }

  openAddMechIssue() {
    const ref = this.modal.open(MechIssueForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('MECH_ISSUE.ADD');
    ref.result.then(() => this.loadMechIssues()).catch(() => { });
  }

  openEditMechIssue(mechIssue: MechIssueDto) {
    const ref = this.modal.open(MechIssueForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.initial = {
      id: mechIssue.id,
      nameAr: mechIssue.nameAr,
      nameEn: mechIssue.nameEn,
      mechIssueTypeId: mechIssue.mechIssueTypeId
    };
    ref.result.then(() => this.loadMechIssues()).catch(() => { });
  }

  deleteMechIssue(mechIssue: MechIssueDto) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`MechIssues/${mechIssue.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.loadMechIssues();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.loadMechIssues();
  }
}
