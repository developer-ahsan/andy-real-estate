import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrderProcess, OrdersList, revertToQuote } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { Router } from '@angular/router';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

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
  strReturn = {
    errorCode: 0,
    message: '',
    statusID: 0,
    statusName: '',
    statusDescription: ''
  };

  // Status Tracking
  ngStatus = 0;
  status: any[];
  statusText = '';

  // ShippingReport
  shippingReportProducts: any;
  isShippingReportLoader: boolean = false;
  isRevertLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _commonService: DashboardsService,
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
    this.getOrderProducts();
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
      this.setOrderTracker()
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
  revertTOQuote() {
    this._commonService.showConfirmation('Reverting this order back to a quote will completely remove this order from the system and revert all artwork statuses to Artwork Approved.  This cannot be undone.  Are you sure you want to continue?', (confirmed) => {
      if (confirmed) {
        let params: revertToQuote = {
          fk_cartID: this.orderDetail.fk_cartID,
          orderID: this.orderDetail.pk_orderID,
          revert_to_quote: true
        }
        this.isRevertLoader = true;
        this._orderService.updateOrderCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res['success']) {
            this._orderService.snackBar(res['message']);
            this.router.navigate(['/apps/quotes', this.orderDetail.fk_cartID]);
          }
          this.isRevertLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      }
    });
  }
  getOrderProducts() {
    this.isShippingReportLoader = true;
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.shippingReportProducts = res["data"];
      this.isShippingReportLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  setOrderTracker() {
    if (this.orderDetail.blnCancelled) {
      this.strReturn.statusID = 0;
      this.strReturn.statusName = 'Order Cancelled';
      this.strReturn.statusDescription = '<b>Your order has been cancelled!</b><br />Your program manager has cancelled this order.'
      return;
    }

    if (this.orderDetail.blnEProcurement) {
      if (this.ngStatus === 1) {
        this.strReturn.statusID = 1;
        this.strReturn.statusName = 'Purchase Order Received';
        this.strReturn.statusDescription = '<b>Your order has been created!</b><br />You will receive your artwork proof(s) within 24 hours.'
        return;
      } else if (this.ngStatus === 2) {
        this.strReturn.statusID = 2;
        this.strReturn.statusName = 'Art Approval Received';
        this.strReturn.statusDescription = '<b>Your art approval has been received!</b><br />We are now waiting for the next approver to submit their response to the artwork proof.'
        return;
      } else if (this.ngStatus === 3) {
        this.strReturn.statusID = 3;
        this.strReturn.statusName = 'All Approvals Received';
        this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />Your order is ready to move to production.'
        return;
      } else if (this.ngStatus === 4) {
        this.strReturn.statusID = 4;
        this.strReturn.statusName = 'In Production';
        this.strReturn.statusDescription = '<b>Your order is in production!</b><br />Estimated ship date(s) will be posted once available.'
        return;
      } else if (this.ngStatus === 5) {
        this.strReturn.statusID = 5;
        this.strReturn.statusName = 'Estimated Ship Date Scheduled';
        this.strReturn.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />Estimated ship date(s) are available.'
        return;
      } else if (this.ngStatus === 6) {
        this.strReturn.statusID = 6;
        this.strReturn.statusName = 'Shipped';
        this.strReturn.statusDescription = '<b>Your order is complete!</b><br />Thank you for your business.'
        return;
      } else {
        if (this.ngStatus === 0) {
          this.strReturn.statusID = 0;
          this.strReturn.statusName = 'Order Created';
          this.strReturn.statusDescription = '<b>Your Order Has Been Created!</b><br />You will receive an artwork proof within 24 hours.'
          return;
        } else if (this.ngStatus === 1) {
          this.strReturn.statusID = 1;
          this.strReturn.statusName = 'Art Proof Sent';
          this.strReturn.statusDescription = '<b>An artwork proof has been sent!</b><br />An artwork proof is awaiting approval.'
          return;
        } else if (this.ngStatus === 2) {
          this.strReturn.statusID = 2;
          this.strReturn.statusName = 'All Approvals Received';
          this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
          return;
        } else if (this.ngStatus === 3) {
          this.strReturn.statusID = 3;
          this.strReturn.statusName = 'In Production';
          this.strReturn.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.'
          return;
        } else if (this.ngStatus === 5) {
          this.strReturn.statusID = 5;
          this.strReturn.statusName = 'Shipped';
          this.strReturn.statusDescription = '<b>Your order has shipped!</b><br />You order is on its way to you.'
          return;
        } else if (this.ngStatus === 6) {
          this.strReturn.statusID = 6;
          this.strReturn.statusName = 'Delivered';
          this.strReturn.statusDescription = '<b>Deliver has been confirmed!</b><br />Thank you for your business!'
          return;
        }
      }
    }
  }
}
