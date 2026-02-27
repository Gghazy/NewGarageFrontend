import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { RoadTestIssueForm } from '../road-test-issue-form/road-test-issue-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';
import { TranslateService } from '@ngx-translate/core';
import { RoadTestIssueDto } from 'src/app/shared/Models/road-test-issues/road-test-issue-dto';

@Component({
  selector: 'app-road-test-issue-list',
  standalone: false,
  templateUrl: './road-test-issue-list.html',
  styleUrl: './road-test-issue-list.css',
})
export class RoadTestIssueList implements OnInit, OnDestroy {
  roadTestIssues: RoadTestIssueDto[] = [];
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
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load() {
    this.loading = true;
    this.apiService.post<any>('RoadTestIssues/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.roadTestIssues = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Failed to load road test issues', 'Error');
          this.loading = false;
        }
      });
  }

  openAdd() {
    const ref = this.modal.open(RoadTestIssueForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('ROAD_TEST_ISSUES.ADD');
    ref.result.then(() => this.load()).catch(() => { });
  }

  openEdit(item: any) {
    const ref = this.modal.open(RoadTestIssueForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.initial = {
      id: item.id,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      roadTestIssueTypeId: item.roadTestIssueTypeId
    };
    ref.result.then(() => this.load()).catch(() => { });
  }

  deleteItem(item: any) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`RoadTestIssues/${item.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.load();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.load();
  }
}
