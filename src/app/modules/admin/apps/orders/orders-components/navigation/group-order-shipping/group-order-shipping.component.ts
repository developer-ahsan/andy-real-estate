import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';

@Component({
  selector: 'app-group-order-shipping',
  templateUrl: './group-order-shipping.component.html'
})
export class GroupOrdersShippingComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  not_available: string = 'N/A';
  not_available_price: string = '0';
  htmlComment: string = '';

  orderDetail: any;
  orderSummary: any;
  orderSummaryDetail: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    // Get the order
    this.getOrderSummary();
  }
  getOrderSummary() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        if (res["data"].length) {
          this.htmlComment = res["data"][0]["internalComments"];
          this.orderDetail = res["data"][0];
          if (!this.orderDetail.blnCancelled) {
            this.getOrderStatus();
          } else {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
            this.orderDetail['OrderStatus'] = false;
            this._orderService.OrderCancelled = true;
          }
        }
      }
    })
  }
  getOrderStatus() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail['OrderStatus'] = res["resultStatus"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
