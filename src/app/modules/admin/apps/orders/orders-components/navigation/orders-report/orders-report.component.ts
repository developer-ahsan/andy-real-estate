import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

interface Transaction {
  item: string;
  cost: number;
}

@Component({
  selector: 'app-orders-report',
  templateUrl: './orders-report.component.html'
})
export class OrdersReportComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  selectedorder: string = 'select_order';
  orders: string[] = [
    'COMBINED ORDER REPORT',
    'The CHC Store - Initiator'
  ];
  displayedColumns: string[] = ['item', 'cost'];
  transactions: Transaction[] = [
    {item: 'Disposable Face Mask', cost: 0.210}
  ];
  

  constructor() { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
  }

  orderSelection(order){
    console.log("order selected", order);
  }

  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value*2000, 0);
  }

}
