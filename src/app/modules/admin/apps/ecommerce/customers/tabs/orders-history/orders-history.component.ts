import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-history',
  templateUrl: './orders-history.component.html'
})
export class OrdersHistoryComponent implements OnInit, OnDestroy {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['pk_orderID', 'orderDate', 'productName', 'storeName'];
  dataSource = [];
  ordersHistoryLength: number = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this._customerService.getOrderHistory(pk_userID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quotes) => {
        this.dataSource = quotes["data"];
        this.ordersHistoryLength = quotes["totalRecords"];
        this._changeDetectorRef.markForCheck();
        this.isLoadingChange.emit(false);
      });
  }

  orderDetails(id) {
    this._router.navigate([`/apps/orders/${id}`]);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
