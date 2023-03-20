import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrderProcess, OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-summary',
  templateUrl: './orders-summary.component.html',
  styles: [".tracker {background-color: #eee;} .tracker-active {background-color: green;color: #fff;} .progress {height: 2rem} ::-webkit-scrollbar {width: 3px !important}"]
})
export class OrdersSummaryComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  not_available: string = 'N/A';
  not_available_price: string = '0';
  htmlComment: string = '';

  orderDetail: any;
  orderSummary: any;
  orderSummaryDetail: any;


  // Status Tracking
  ngStatus = 0;
  status: any[];
  statusText = '';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.status = [
      {
        value: '1',
        label: 'Art Proof Sent',
      },
      {
        value: '2',
        label: 'All Approvals Received',
      },
      {
        value: '3',
        label: 'In Production'
      },
      {
        value: '4',
        label: 'Estimated Ship Date Scheduled'
      },
      {
        value: '5',
        label: 'Shipped'
      },
      {
        value: '6',
        label: 'Delivery Confirmation'
      }
    ];
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
      this.getOrderStatusProcess(res["data"]);
      this.orderDetail['OrderStatus'] = res["resultStatus"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getOrderStatusProcess(data) {
    let ids = [];
    data.forEach(element => {
      ids.push(element.pk_orderLineID);
    });
    let payload: OrderProcess = {
      bln_cancelled: this.orderDetail.blnCancelled,
      order_lines: ids.toString(),
      bln_Eprocurement: this.orderDetail.blnEProcurement,
      get_order_process: true
    }
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.ngStatus = res["statusID"];
      this.statusText = res["statusDescription"];
      this._changeDetectorRef.markForCheck();
    })
  }
  goToComments() {
    this.router.navigateByUrl(`/apps/orders/${this.orderDetail.pk_orderID}/comments`);
  }
}
