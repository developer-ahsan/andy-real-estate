import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-group-orders',
  templateUrl: './group-orders.component.html'
})
export class GroupOrdersComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  displayedColumns: string[] = ['pk_orderID', 'orderDate', 'productName', 'storeName'];
  dataSource = [];
  ordersHistoryLength: number = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  orderDetail: any;
  random = Math.random();
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
        let params = {
          user_id: this.selectedCustomer.pk_userID,
          get_user_group_orders: true
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(group_orders => {
          this.dataSource = group_orders["data"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }

  orderDetails(order) {
    this.random = Math.random();
    console.log(order)
    this.orderDetail = order;
    this.orderDetail.detailsLoader = true;
    let params = {
      group_order_details: true,
      order_id: order.orderID,
      store_id: order.storeID,
      group_order_id: order.ID
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.Artworks = [];

        if (element.Artwork) {
          const artworks = element.Artwork.split(',,');

          element.Artworks = artworks.map(artwork => {
            const [location, method, status] = artwork.split('::');
            const isProcessing = status != 7 && status != 9 && status != 17;

            return {
              location,
              method,
              status,
              statusName: isProcessing ? 'Processing' : 'Approved',
              color: isProcessing ? 'text-red-500' : 'text-green-500'
            };
          });
        }
      });

      this.orderDetail.detail = res["data"];
      this.orderDetail.detailsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
    // group_order_details=true&order_id=&store_id=&group_order_id
    // this._router.navigate([`/apps/orders/${id}`]);
  }
  backToList() {
    this.orderDetail = null;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
