import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-orders-shipping-reports',
  templateUrl: './orders-shipping-reports.component.html'
})
export class OrdersShippingReportsComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

}
