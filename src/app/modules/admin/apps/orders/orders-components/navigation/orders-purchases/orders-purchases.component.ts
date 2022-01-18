import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface OrdersPurchases {
  company: string;
  supplies: boolean;
  decorates: boolean;
  digitizes: boolean;
  total: number;
}

@Component({
  selector: 'app-orders-purchases',
  templateUrl: './orders-purchases.component.html'
})
export class OrdersPurchasesComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  displayedColumns: string[] = ['company', 'supplies', 'decorates', 'digitizes', 'total'];
  transactions: OrdersPurchases[] = [
    {company: 'ARTWORK', supplies: true, decorates: false, digitizes: false, total: 255},
    {company: 'HI-ORDER', supplies: false, decorates: false, digitizes: true, total: 58},
  ];
  isView: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  getTotalCost() {
    return this.transactions.map(t => t.total).reduce((acc, value) => acc + value, 0);
  }

  viewPurchaseOrder(): void {
    this.isView = !this.isView;
  }

}

