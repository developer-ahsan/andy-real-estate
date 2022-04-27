import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-products-suppliers',
  templateUrl: './products-suppliers.component.html'
})
export class ProductsSuppliersComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }
}
