import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';

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
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedOrder: OrdersList = null;
  selectedOrderDetails = [];
  orders: string[] = [
    'COMBINED ORDER REPORT',
    'The CHC Store - Initiator'
  ];
  displayedColumns: string[] = ['item', 'cost'];
  transactions: Transaction[] = [
    { item: 'Disposable Face Mask', cost: 0.210 }
  ];
  showForm: boolean = false;


  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Get the order
    this._orderService.orders$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((orders: OrdersList[]) => {
        this.selectedOrder = orders["data"].find(x => x.pk_orderID == location.pathname.split('/')[3]);
        console.log("this.selectedOrder", this.selectedOrder)
        this._orderService.getOrderDetails(this.selectedOrder.pk_orderID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((orderDetails) => {
            this.selectedOrderDetails = orderDetails["data"];

            console.log("selectedOrderDetails", this.selectedOrderDetails);
            this.isLoadingChange.emit(false);

            this._changeDetectorRef.markForCheck();
          });
      });
  }

  orderSelection(order) {
    console.log("order selected", order);
    this.showForm = true;
  }

  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value * 2000, 0);
  }

}
