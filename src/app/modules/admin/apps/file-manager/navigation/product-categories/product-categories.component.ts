import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-categories',
  templateUrl: './product-categories.component.html'
})
export class ProductCategoriesComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }
}
