import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-page-size',
  standalone: false,
  templateUrl: './page-size.component.html',
  styleUrls: ['./page-size.component.scss']
})
export class PageSizeComponent {

  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [1,5, 10, 20, 50];
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() search = new EventEmitter<void>();

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageSizeChange.emit(this.pageSize);
    this.search.emit();
  }


}

