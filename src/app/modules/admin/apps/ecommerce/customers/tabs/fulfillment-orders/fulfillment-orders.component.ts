import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-fulfillment-orders',
  templateUrl: './fulfillment-orders.component.html'
})
export class FulfillmentOrdersComponent implements OnInit {
  @Input() currentSelectedCustomer: any;

  constructor() { }

  ngOnInit(): void {
  }

}
