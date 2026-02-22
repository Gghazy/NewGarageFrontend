import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { PageSizeComponent } from '../page-size/page-size.component';

@Component({
  selector: 'app-shared-list',
  standalone: false,
  templateUrl: './shared-list.html',
  styleUrl: './shared-list.css',
})
export class SharedList {
@Input({ required: true }) titleKey!: string;           
  @Input() addLabelKey?: string;                        
  @Input() canAdd = false;                              
  @Output() addClicked = new EventEmitter<void>();

  // ---- Page size ----
  @Input() showPageSize = true;
  @Input({ required: true }) pagingConfig!: any;        
  @Output() pageSizeSearch = new EventEmitter<void>();  

  // ---- List ----
  @Input() items: any[] = [];
  @Input() emptyText = 'No data found';

  // ---- Pagination ----
  @Input() maxSize = 5;
  @Input() prevKey = 'PAGINATION.PREVIOUS';
  @Input() nextKey = 'PAGINATION.NEXT';

  @Output() pageChanged = new EventEmitter<number>(); 
}
