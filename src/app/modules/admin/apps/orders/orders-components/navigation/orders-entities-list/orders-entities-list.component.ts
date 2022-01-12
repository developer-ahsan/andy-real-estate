import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-orders-entities-list',
  templateUrl: './orders-entities-list.component.html'
})
export class OrdersEntitiesListComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }

}
