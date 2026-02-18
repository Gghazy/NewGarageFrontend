import { Component } from '@angular/core';
import { ServiceForm } from '../service-form/service-form';
import { ApiService } from 'src/app/core/services/custom.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { ServiceDto } from 'src/app/shared/Models/service/service-dto';

@Component({
  selector: 'app-service-list',
  standalone: false,
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceList {
  services: any[] = [];
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
    this.loadServices();
  }

  loadServices() {
    this.loading = true;

    this.apiService.post<any>('Services/pagination', this.pagingConfig).subscribe({
      next: (data) => {
        this.services = data.items;
        
        this.pagingConfig.totalItems = data.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading mech issues', err);
        this.loading = false;
      }
    });
  }
  openAddService() {
    const ref = this.modal.open(ServiceForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SERVICE.ADD');

    ref.result.then((value: ServiceDto) => {
      this.loadServices();
    }).catch(() => { });

  }
  openEditService(service: any) {
    const ref = this.modal.open(ServiceForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.serviceId = service.id;

    ref.result.then((value: ServiceDto) => {
      this.loadServices();
    }).catch(() => { });
  }
  search() {
    this.pagingConfig.currentPage = 1;
    this.loadServices();
  }
}
