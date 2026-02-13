import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { ServicePriceForm } from '../service-price-form/service-price-form';
import { ServicePriceDto } from 'src/app/shared/Models/service/service-price-dto';

@Component({
  selector: 'app-service-price-list',
  standalone: false,
  templateUrl: './service-price-list.html',
  styleUrl: './service-price-list.css',
})
export class ServicePriceList {
  servicePrices: any[] = [];
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

    this.apiService.post<any>('ServicePrices/pagination', this.pagingConfig).subscribe({
      next: (data) => {
        this.servicePrices = data.items;
        debugger
        this.pagingConfig.totalItems = data.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading mech issues', err);
        this.loading = false;
      }
    });
  }
  openAddServicePrice() {
    const ref = this.modal.open(ServicePriceForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SERVICE_PRICE.ADD');

    ref.result.then((value: ServicePriceDto) => {
      this.loadServices();
    }).catch(() => { });

  }
  openEditServicePrice(service: any) {
    const ref = this.modal.open(ServicePriceForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.serviceId = service.id;

    ref.result.then((value: ServicePriceDto) => {
      this.loadServices();
    }).catch(() => { });
  }
  search() {
    this.pagingConfig.currentPage = 1;
    this.loadServices();
  }
}
