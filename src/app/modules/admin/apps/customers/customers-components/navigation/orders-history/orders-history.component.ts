import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-orders-history',
  templateUrl: './orders-history.component.html'
})
export class OrdersHistoryComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['pk_orderID', 'orderDate', 'productName', 'storeName', 'total', 'paid', 'cancel', 'status'];
  dataSource = [];
  ordersHistoryLength: number = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  page = 1;
  totalOrder = 0;
  grandTotal = 0;
  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCustomer();
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getOrdersHistory();
      });
  }
  getOrdersHistory() {
    let params = {
      orders_history: true,
      user_id: this.selectedCustomer.pk_userID,
      page: this.page,
      size: 20
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(quotes => {
      this.dataSource = quotes["data"];
      this.totalOrder = quotes["totalRecords"];
      this.grandTotal = quotes["grandTotal"];
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextOrders(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getOrdersHistory();
  };
  orderDetails(id) {
    this._router.navigate([`/apps/orders/${id}`]);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
