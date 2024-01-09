import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrderProcess, OrdersList, revertToQuote } from 'app/modules/admin/apps/orders/orders-components/orders.types';
import { Router } from '@angular/router';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import moment from 'moment';
import { products } from 'app/mock-api/apps/ecommerce/inventory/data';

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
    statusDate: '',
    trackingNumber: '',
    estimatedShippingDate: '',
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
  orderPOs = [];

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
        this.orderPOs = res["qryPO"];
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
      // this.setOrderTracker();
      // console.log(this.strReturn);
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
      const orderLines = res["data"];
      for (let i = 0; i < orderLines.length; i++) {
        orderLines[i].statusData = {
          statusID: '',
          statusName: '',
          statusDate: '',
          trackingNumber: '',
          estimatedShippingDate: ''
        }
        this.processOrderLineAsync(orderLines[i]).then(res => {
          this.getOrderLineTracking(res);
        })
      }
      this.shippingReportProducts = res["data"];
      console.log(this.shippingReportProducts)
      this.isShippingReportLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  processOrderLineAsync(orderLine) {
    return new Promise((resolve) => {
      let orderLineStatus;
      orderLine.qryOrderLineStatus;
      if (orderLine.qryOrderLineStatus) {
        const [id, name, date] = orderLine.qryOrderLineStatus.split('::');
        orderLine.qryOrderLineStatus = { id, name, date };
      }

      let pos;
      orderLine.qryPOS = [];

      if (orderLine.getOrderLineTracking) {
        pos = orderLine.getOrderLineTracking.split(',,');
        pos.forEach(element => {
          const [statusName, statusID, estimatedShippingDate, trackingNumber, shippingDate, blnSupplier, blnDecorator] = element.split('::');
          let supplier = blnSupplier == '1';
          let decorator = blnDecorator == '1';
          orderLine.qryPOS.push({ statusName, statusID: Number(statusID), estimatedShippingDate, trackingNumber, shippingDate, blnSupplier: supplier, blnDecorator: decorator });
        });
      }
      orderLine.imprintStatus = [];
      if (orderLine.qryImprintStatus) {
        let imprints = orderLine.qryImprintStatus.split(',,');
        imprints.forEach(element => {
          const [statusID] = element.split(',,');
          orderLine.imprintStatus.push({ statusID: Number(statusID) });
        });
      }
      resolve(orderLine);
    });
  }
  getOrderLineTracking(orderLine: any) {
    if (this.orderDetail.blnEProcurement) {
      let blnApproved = 0;
      if (orderLine.qryPOS.length) {
        orderLine.qryPOS.forEach((product, index) => {
          if (index == 0) {
            orderLine.statusData.statusID = product.statusID;
            orderLine.statusData.statusName = product.statusName;
            orderLine.statusData.statusDate = product.statusDate;
            orderLine.statusData.trackingNumber = product.trackingNumber;
            orderLine.statusData.estimatedShippingDate = product.estimatedShippingDate;
          }
        });
      } else {
        orderLine.statusData.statusID = 5;
        orderLine.statusData.statusName = 'Shipped';
        orderLine.statusData.statusDate = moment().format('mm/dd/yyyy');
        orderLine.statusData.trackingNumber = '';
        orderLine.statusData.estimatedShippingDate = '';
      }
      const status = [5, 6, 8, 11, 12, 13];
      if (orderLine.statusData.statusID == 1) {
        orderLine.statusData.statusID = 1;
        orderLine.statusData.statusName = 'Purchase Order Received';
        orderLine.statusData.statusDescription = '<b>Your order has been created!</b><br />You will receive your artwork proof(s) within 24 hours.'
        return;
      } else if (status.includes(orderLine.statusData.statusID)) {
        orderLine.statusData.statusID = 6;
        orderLine.statusData.statusName = 'Shipped';
        orderLine.statusData.statusDescription = '<b>You order has shipped!</b><br />Your order is on your way to you.';
        return;
      } else if (orderLine.statusData.estimatedShippingDate != 'N/A') {
        orderLine.statusData.statusID = 5;
        orderLine.statusData.statusName = 'Estimated Ship Date Scheduled';
        orderLine.statusData.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />You order is scheduled to ship.';
        return;
      } else if (orderLine.statusData.statusID == 3 || orderLine.statusData.statusID == 4) {
        orderLine.statusData.statusID = 4;
        orderLine.statusData.statusName = 'In production';
        orderLine.statusData.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.';
        return;
      } else {
        blnApproved = 1;
        const approvedStatuses = [7, 9];
        if (!orderLine.imprintStatus.every(status => !approvedStatuses.includes(status))) {
          blnApproved = 0;
        }
        if (!blnApproved) {
          orderLine.statusData.statusID = 2;
          orderLine.statusData.statusName = 'Art Approval Received';
          orderLine.statusData.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
          return;
        } else {
          orderLine.statusData.statusID = 3;
          orderLine.statusData.statusName = 'Your Artwork Approval Received';
          orderLine.statusData.statusDescription = '<b>Your artwork approval has been received!</b><br />We are now waiting for the next approver to submit their response to the artwork proof.'
          return;
        }
      }
    } else {
      let blnApproved = 0;
      if (orderLine.qryPOS.length > 0) {
        orderLine.qryPOS.forEach((product, index) => {
          if (index == 0) {
            orderLine.statusData.statusID = product.statusID;
            orderLine.statusData.statusName = product.statusName;
            orderLine.statusData.statusDate = product.statusDate;
            orderLine.statusData.trackingNumber = product.trackingNumber;
            orderLine.statusData.estimatedShippingDate = product.estimatedShippingDate;
          }

        });

      } else {
        orderLine.statusData.statusID = 5;
        orderLine.statusData.statusName = 'Shipped';
        orderLine.statusData.statusDate = moment().format('mm/dd/yyyy');
        orderLine.statusData.trackingNumber = '';
        orderLine.statusData.estimatedShippingDate = '';
      }
      const status = [5, 6, 8, 11, 12, 13];
      if (status.includes(orderLine.statusData.statusID)) {
        orderLine.statusData.statusID = 6;
        orderLine.statusData.statusName = 'Shipped';
        orderLine.statusData.statusDescription = '<b>You order has shipped!</b><br />Your order is on your way to you.';
        return;
      } else if (orderLine.statusData.estimatedShippingDate != 'N/A') {
        orderLine.statusData.statusID = 5;
        orderLine.statusData.statusName = 'Estimated Ship Date Scheduled';
        orderLine.statusData.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />You order is scheduled to ship.';
        return;
      } else if (orderLine.statusData.statusID == 3 || orderLine.statusData.statusID == 4) {
        orderLine.statusData.statusID = 4;
        orderLine.statusData.statusName = 'In production';
        orderLine.statusData.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.';
        return;
      } else {
        blnApproved = 1;
        const approvedStatuses = [7, 9];
        if (!orderLine.imprintStatus.every(status => !approvedStatuses.includes(status))) {
          blnApproved = 0;
        }
        if (!blnApproved) {
          orderLine.statusData.statusID = 2;
          orderLine.statusData.statusName = 'Art Approval Received';
          orderLine.statusData.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
          return;
        }
        let blnProofSent = 0;
        const proofSentStatuses = [1, 3, 4, 12, 13];
        if (orderLine.imprintStatus.some(status => proofSentStatuses.includes(status))) {
          blnProofSent = 1;
        }

        if (blnProofSent) {
          orderLine.statusData.statusID = 1;
          orderLine.statusData.statusName = 'Art Proof Sent';
          orderLine.statusData.statusDescription = '<b>An art proof has been sent!</b><br />An artwork proof is awaiting approval.'
          return;
        } else {
          orderLine.statusData.statusID = 1;
          orderLine.statusData.statusName = 'Order Created';
          orderLine.statusData.statusDescription = '<b>Your Order Has Been Created!</b><br />You will receive an artwork proof within 24 hours.'
          return;
        }
      }
    }
    // });

  }
  setOrderTracker() {
    if (this.orderDetail.blnEProcurement) {
      let blnApproved = 0;
      if (this.shippingReportProducts.qryPOS.length) {
        this.shippingReportProducts.qryPOS.forEach((product, index) => {
          if (index == 0) {
            this.strReturn.statusID = product.statusID;
            this.strReturn.statusName = product.statusName;
            this.strReturn.statusDate = product.statusDate;
            this.strReturn.trackingNumber = product.trackingNumber;
            this.strReturn.estimatedShippingDate = product.estimatedShippingDate;
          }
        });
      } else {
        this.strReturn.statusID = 5;
        this.strReturn.statusName = 'Shipped';
        this.strReturn.statusDate = moment().format('mm/dd/yyyy');
        this.strReturn.trackingNumber = '';
        this.strReturn.estimatedShippingDate = '';
      }
      const status = [5, 6, 8, 11, 12, 13];
      if (this.strReturn.statusID == 1) {
        this.strReturn.statusID = 1;
        this.strReturn.statusName = 'Purchase Order Received';
        this.strReturn.statusDescription = '<b>Your order has been created!</b><br />You will receive your artwork proof(s) within 24 hours.'
        return;
      } else if (status.includes(this.strReturn.statusID)) {
        this.strReturn.statusID = 6;
        this.strReturn.statusName = 'Shipped';
        this.strReturn.statusDescription = '<b>You order has shipped!</b><br />Your order is on your way to you.';
        return;
      } else if (this.strReturn.estimatedShippingDate != 'N/A') {
        this.strReturn.statusID = 5;
        this.strReturn.statusName = 'Estimated Ship Date Scheduled';
        this.strReturn.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />You order is scheduled to ship.';
        return;
      } else if (this.strReturn.statusID == 3 || this.strReturn.statusID == 4) {
        this.strReturn.statusID = 4;
        this.strReturn.statusName = 'In production';
        this.strReturn.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.';
        return;
      } else {
        blnApproved = 1;
        if (!this.shippingReportProducts.imprintStatuses.includes(7) && !this.shippingReportProducts.imprintStatuses.includes(9)) {
          blnApproved = 0;
        }
        if (!blnApproved) {
          this.strReturn.statusID = 2;
          this.strReturn.statusName = 'Art Approval Received';
          this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
          return;
        } else {
          this.strReturn.statusID = 3;
          this.strReturn.statusName = 'Your Artwork Approval Received';
          this.strReturn.statusDescription = '<b>Your artwork approval has been received!</b><br />We are now waiting for the next approver to submit their response to the artwork proof.'
          return;
        }
      }
    } else {
      let blnApproved = 0;
      if (this.shippingReportProducts.qryPOS.length) {
        this.shippingReportProducts.qryPOS.forEach((product, index) => {
          if (index == 0) {
            this.strReturn.statusID = product.statusID;
            this.strReturn.statusName = product.statusName;
            this.strReturn.statusDate = product.statusDate;
            this.strReturn.trackingNumber = product.trackingNumber;
            this.strReturn.estimatedShippingDate = product.estimatedShippingDate;
          }

        });

      } else {
        this.strReturn.statusID = 5;
        this.strReturn.statusName = 'Shipped';
        this.strReturn.statusDate = moment().format('mm/dd/yyyy');
        this.strReturn.trackingNumber = '';
        this.strReturn.estimatedShippingDate = '';
      }
      const status = [5, 6, 8, 11, 12, 13];
      if (status.includes(this.strReturn.statusID)) {
        this.strReturn.statusID = 6;
        this.strReturn.statusName = 'Shipped';
        this.strReturn.statusDescription = '<b>You order has shipped!</b><br />Your order is on your way to you.';
        return;
      } else if (this.strReturn.estimatedShippingDate != 'N/A') {
        this.strReturn.statusID = 5;
        this.strReturn.statusName = 'Estimated Ship Date Scheduled';
        this.strReturn.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />You order is scheduled to ship.';
        return;
      } else if (this.strReturn.statusID == 3 || this.strReturn.statusID == 4) {
        this.strReturn.statusID = 4;
        this.strReturn.statusName = 'In production';
        this.strReturn.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.';
        return;
      } else {
        blnApproved = 1;
        if (!this.shippingReportProducts.imprintStatuses.includes(7) && !this.shippingReportProducts.imprintStatuses.includes(9)) {
          blnApproved = 0;
        }
        if (!blnApproved) {
          this.strReturn.statusID = 2;
          this.strReturn.statusName = 'Art Approval Received';
          this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
          return;
        }
        let blnProofSent = 0;
        if (this.shippingReportProducts.imprintStatuses.includes(1) || this.shippingReportProducts.imprintStatuses.includes(3) || this.shippingReportProducts.imprintStatuses.includes(4) || this.shippingReportProducts.imprintStatuses.includes(12) || this.shippingReportProducts.imprintStatuses.includes(13)) {
          blnProofSent = 1;
        }
        if (blnProofSent) {
          this.strReturn.statusID = 1;
          this.strReturn.statusName = 'Art Proof Sent';
          this.strReturn.statusDescription = '<b>An art proof has been sent!</b><br />An artwork proof is awaiting approval.'
          return;
        } else {
          this.strReturn.statusID = 1;
          this.strReturn.statusName = 'Order Created';
          this.strReturn.statusDescription = '<b>Your Order Has Been Created!</b><br />You will receive an artwork proof within 24 hours.'
          return;
        }
      }


      // else if (this.ngStatus == 2) {
      //   this.strReturn.statusID = 2;
      //   this.strReturn.statusName = 'Art Approval Received';
      //   this.strReturn.statusDescription = '<b>Your art approval has been received!</b><br />We are now waiting for the next approver to submit their response to the artwork proof.'
      //   return;
      // } else if (this.ngStatus === 3) {
      //   this.strReturn.statusID = 3;
      //   this.strReturn.statusName = 'All Approvals Received';
      //   this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />Your order is ready to move to production.'
      //   return;
      // } else if (this.ngStatus === 4) {
      //   this.strReturn.statusID = 4;
      //   this.strReturn.statusName = 'In Production';
      //   this.strReturn.statusDescription = '<b>Your order is in production!</b><br />Estimated ship date(s) will be posted once available.'
      //   return;
      // } else if (this.ngStatus === 5) {
      //   this.strReturn.statusID = 5;
      //   this.strReturn.statusName = 'Estimated Ship Date Scheduled';
      //   this.strReturn.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />Estimated ship date(s) are available.'
      //   return;
      // } else if (this.ngStatus === 6) {
      //   this.strReturn.statusID = 6;
      //   this.strReturn.statusName = 'Shipped';
      //   this.strReturn.statusDescription = '<b>Your order is complete!</b><br />Thank you for your business.'
      //   return;
      // } else {
      //   if (this.ngStatus === 0) {
      //     this.strReturn.statusID = 0;
      //     this.strReturn.statusName = 'Order Created';
      //     this.strReturn.statusDescription = '<b>Your Order Has Been Created!</b><br />You will receive an artwork proof within 24 hours.'
      //     return;
      //   } else if (this.ngStatus === 1) {
      //     this.strReturn.statusID = 1;
      //     this.strReturn.statusName = 'Art Proof Sent';
      //     this.strReturn.statusDescription = '<b>An artwork proof has been sent!</b><br />An artwork proof is awaiting approval.'
      //     return;
      //   } else if (this.ngStatus === 2) {
      //     this.strReturn.statusID = 2;
      //     this.strReturn.statusName = 'All Approvals Received';
      //     this.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
      //     return;
      //   } else if (this.ngStatus === 3) {
      //     this.strReturn.statusID = 3;
      //     this.strReturn.statusName = 'In Production';
      //     this.strReturn.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.'
      //     return;
      //   } else if (this.ngStatus === 5) {
      //     this.strReturn.statusID = 5;
      //     this.strReturn.statusName = 'Shipped';
      //     this.strReturn.statusDescription = '<b>Your order has shipped!</b><br />You order is on its way to you.'
      //     return;
      //   } else if (this.ngStatus === 6) {
      //     this.strReturn.statusID = 6;
      //     this.strReturn.statusName = 'Delivered';
      //     this.strReturn.statusDescription = '<b>Deliver has been confirmed!</b><br />Thank you for your business!'
      //     return;
      //   }
      // }
    }
  }
}
