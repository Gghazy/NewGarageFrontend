import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { MechIssueForm } from '../mech-issue-form/mech-issue-form';
import { TranslateService } from '@ngx-translate/core';
import { MechIssueDto } from 'src/app/shared/Models/mech-issues/mech-issue-dto';

@Component({
  selector: 'app-mech-issue-list',
  standalone: false,
  templateUrl: './mech-issue-list.html',
  styleUrl: './mech-issue-list.css',
})
export class MechIssueList {
  mechIssues: any[] = [];
  loading = false;

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

  loadMechIssues() {
    this.loading = true;

    this.apiService.post<any>('MechIssues/pagination', this.pagingConfig).subscribe({
      next: (data) => {
        this.mechIssues = data.items;
        
        this.pagingConfig.totalItems = data.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading mech issues', err);
        this.loading = false;
      }
    });
  }
  openAddMechIssue() {
    const ref = this.modal.open(MechIssueForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('MECH_ISSUE.ADD');

    ref.result.then((value: MechIssueDto) => {
      this.loadMechIssues();
    }).catch(() => { });

  }
  openEditMechIssue(mechIssue: any) {
    const ref = this.modal.open(MechIssueForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.initial = {
      id: mechIssue.id,
      nameAr: mechIssue.nameAr,
      nameEn: mechIssue.nameEn,
      mechIssueTypeId: mechIssue.mechIssueTypeId
    };

    ref.result.then((value: MechIssueDto) => {
      this.loadMechIssues();
    }).catch(() => { });
  }
  search() {
    this.pagingConfig.currentPage = 1;
    this.loadMechIssues();
  }
}
