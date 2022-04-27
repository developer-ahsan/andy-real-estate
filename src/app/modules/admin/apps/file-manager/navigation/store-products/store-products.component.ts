import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html'
})
export class StoreProductsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }

}
