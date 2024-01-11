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
  qryTrackerArray = [];
  strnStatus: any;

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
          console.log(this.orderDetail);
          this.orderDetail.strReturn = {
            statusID: null,
            statusName: null,
            statusDescription: null
          };

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
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(async res => {
      const orderLines = res["data"];
      for (let orderLine of orderLines) {
        orderLine.statusData = {
          statusID: '',
          statusName: '',
          statusDate: '',
          trackingNumber: '',
          estimatedShippingDate: ''
        };

        const res = await this.processOrderLineAsync(orderLine);
        this.getOrderLineTracking(res);
      }
      this.shippingReportProducts = res["data"];
      this.setOrderTracker();
      console.log(this.orderDetail);
      console.log(this.shippingReportProducts);
      this.isShippingReportLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  processOrderLineAsync(orderLine) {
    return new Promise((resolve) => {
      // let orderLineStatus;
      // if (orderLine.qryOrderLineStatus) {
      //   const [id, name, date] = orderLine.qryOrderLineStatus.split('::');
      //   orderLine.qryOrderLineStatus = { id, name, date };
      // }

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
          orderLine.imprintStatus.push(Number(statusID));
        });
      }
      resolve(orderLine);
    });
  }
  getOrderLineTracking(orderLine: any) {
    let local = {
      qryTemp: [],
      count: 0
    };

    if (orderLine.qryPOS.length > 0) {
      for (let i = 0; i < orderLine.qryPOS.length; i++) {
        local.count++;
        let row = {
          statusID: orderLine.qryPOS[i].statusID,
          statusName: orderLine.qryPOS[i].statusName,
          statusDate: orderLine.qryPOS[i].shippingDate,
          trackingNumber: orderLine.qryPOS[i].trackingNumber,
          estimatedShippingDate: orderLine.qryPOS[i].estimatedShippingDate
        };
        local.qryTemp.push(row);
      }
    } else {
      local.count++;
      let row = {
        statusID: 5,
        statusName: 'Shipped',
        statusDate: new Date().toLocaleDateString('en-US'),
        trackingNumber: '',
        estimatedShippingDate: ''
      };
      local.qryTemp.push(row);
    }
    // Sort the array by statusID in ascending order
    local.qryTemp.sort((a, b) => a.statusID - b.statusID);

    orderLine.strReturn = {
      statusID: null,
      statusName: null,
      statusDescription: null,
      trackingNumber: null,
      estimatedShippingDate: null
    };

    if (this.orderDetail.blnEProcurement) {
      orderLine.strReturn.trackingNumber = local.qryTemp[0].trackingNumber;
      orderLine.strReturn.estimatedShippingDate = local.qryTemp[0].estimatedShippingDate;
      let blnApproved = 0;
      const status = [5, 6, 8, 11, 12, 13];
      if (local.qryTemp[0].statusID == 1) {
        orderLine.strReturn.statusID = 1;
        orderLine.strReturn.statusName = 'Purchase Order Received';
        orderLine.strReturn.statusDescription = '<b>Your order has been created!</b><br />You will receive your artwork proof(s) within 24 hours.'
        return;
      } else if (status.includes(local.qryTemp[0].statusID) &&
        local.qryTemp[0].trackingNumber && local.qryTemp[0].trackingNumber != 'N/A') {
        orderLine.strReturn.statusID = 6;
        orderLine.strReturn.statusName = 'Shipped';
        orderLine.strReturn.statusDescription = '<b>You order has shipped!</b><br />Your order is on your way to you.';
        return;
      } else if (local.qryTemp[0].estimatedShippingDate && local.qryTemp[0].estimatedShippingDate != 'N/A') {
        orderLine.strReturn.statusID = 5;
        orderLine.strReturn.statusName = 'Estimated Ship Date Scheduled';
        orderLine.strReturn.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />You order is scheduled to ship.';
        return;
      } else if (local.qryTemp[0].statusID == 3 || local.qryTemp[0].statusID == 4) {
        orderLine.strReturn.statusID = 4;
        orderLine.strReturn.statusName = 'In production';
        orderLine.strReturn.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.';
        return;
      } else {
        blnApproved = 1;
        const approvedStatuses = [7, 9];
        if (!orderLine.imprintStatus.every(status => approvedStatuses.includes(status))) {
          blnApproved = 0;
        }
        if (blnApproved) {
          orderLine.strReturn.statusID = 3;
          orderLine.strReturn.statusName = 'Art Approval Received';
          orderLine.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
          return;
        } else {
          orderLine.strReturn.statusID = 2;
          orderLine.strReturn.statusName = 'Your Artwork Approval Received';
          orderLine.strReturn.statusDescription = '<b>Your artwork approval has been received!</b><br />We are now waiting for the next approver to submit their response to the artwork proof.'
          return;
        }
      }
    } else {
      orderLine.strReturn.trackingNumber = local.qryTemp[0].trackingNumber;
      orderLine.strReturn.estimatedShippingDate = local.qryTemp[0].estimatedShippingDate;
      let blnApproved = 0;
      const status = [5, 6, 8, 11, 12, 13];
      if (status.includes(local.qryTemp[0].statusID) &&
        local.qryTemp[0].trackingNumber && local.qryTemp[0].trackingNumber != 'N/A') {
        orderLine.strReturn.statusID = 5;
        orderLine.strReturn.statusName = 'Shipped';
        orderLine.strReturn.statusDescription = '<b>You order has shipped!</b><br />Your order is on your way to you.';
        return;
      } else if (local.qryTemp[0].estimatedShippingDate && local.qryTemp[0].estimatedShippingDate != 'N/A') {
        orderLine.strReturn.statusID = 4;
        orderLine.strReturn.statusName = 'Estimated Ship Date Scheduled';
        orderLine.strReturn.statusDescription = '<b>An estimated ship date has been scheduled!</b><br />You order is scheduled to ship.';
        return;
      } else if (local.qryTemp[0].statusID == 3 || local.qryTemp[0].statusID == 4) {
        orderLine.strReturn.statusID = 3;
        orderLine.strReturn.statusName = 'In production';
        orderLine.strReturn.statusDescription = '<b>Your order is in production!</b><br />We will have shipping information available next.';
        return;
      } else {
        blnApproved = 1;
        const approvedStatuses = [7, 9];
        if (!orderLine.imprintStatus.every(status => approvedStatuses.includes(status))) {
          blnApproved = 0;
        }
        if (blnApproved) {
          orderLine.strReturn.statusID = 2;
          orderLine.strReturn.statusName = 'All Approvals Received';
          orderLine.strReturn.statusDescription = '<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged.'
          return;
        }
        let blnProofSent = 0;
        const proofSentStatuses = [1, 3, 4, 12, 13];
        if (orderLine.imprintStatus.some(status => proofSentStatuses.includes(status))) {
          blnProofSent = 1;
        }
        if (blnProofSent) {
          orderLine.strReturn.statusID = 1;
          orderLine.strReturn.statusName = 'Art Proof Sent';
          orderLine.strReturn.statusDescription = '<b>An art proof has been sent!</b><br />An artwork proof is awaiting approval.'
          return;
        } else {
          orderLine.strReturn.statusID = 0;
          orderLine.strReturn.statusName = 'Order Created';
          orderLine.strReturn.statusDescription = '<b>Your Order Has Been Created!</b><br />You will receive an artwork proof within 24 hours.'
          return;
        }
      }
    }

    // });

  }
  setOrderTracker() {
    this.orderDetail.strReturn = {
      statusID: null,
      statusName: null,
      statusDescription: null
    };

    if (this.orderDetail.blnCancelled) {
      this.orderDetail.strReturn.statusID = 0;
      this.orderDetail.strReturn.statusName = 'Order Cancelled';
      this.orderDetail.strReturn.statusDescription = '<b>Your order has been cancelled!</b><br />Your program manager has cancelled this order.';
      return;
    }

    const qryOrderStatusTemp = [];

    for (let shippingReport of this.shippingReportProducts) {
      console.log(shippingReport)
      if (shippingReport.strReturn) {
        const row = {
          statusID: shippingReport.strReturn.statusID,
          statusName: shippingReport.strReturn.statusName,
          statusDate: shippingReport.strReturn.shippingDate,
          trackingNumber: shippingReport.strReturn.trackingNumber,
          estimatedShippingDate: shippingReport.strReturn.estimatedShippingDate
        };
        qryOrderStatusTemp.push(row);
      }
    }

    // Sort the array by statusID in ascending order
    qryOrderStatusTemp.sort((a, b) => a.statusID - b.statusID);

    console.log(qryOrderStatusTemp[0]);
    if (qryOrderStatusTemp.length) {
      this.qryTrackerArray = [];

      if (this.orderDetail.blnEProcurement) {
        this.qryTrackerArray.push(
          { value: 1, status: 'Purchase Order Received' },
          { value: 2, status: 'Your Artwork Approval Received' },
          { value: 3, status: 'All Approvals Received' },
          { value: 4, status: 'In Production' },
          { value: 5, status: 'Estimated Ship Date Scheduled' },
          { value: 6, status: 'Shipped' }
        );
        switch (qryOrderStatusTemp[0].statusID) {
          case 1:
            this.orderDetail.strReturn.statusID = 1;
            this.orderDetail.strReturn.statusName = "Purchase Order Received";
            this.orderDetail.strReturn.statusDescription = "<b>Your order has been created!</b><br />You will receive your artwork proof(s) within 24 hours.";
            return

          case 2:
            this.orderDetail.strReturn.statusID = 2;
            this.orderDetail.strReturn.statusName = "Art Approval Received";
            this.orderDetail.strReturn.statusDescription = "<b>Your art approval has been received!</b><br />We are now waiting for the next approver to submit their response to the artwork proof.";
            return

          case 3:
            this.orderDetail.strReturn.statusID = 3;
            this.orderDetail.strReturn.statusName = "All Approvals Received";
            this.orderDetail.strReturn.statusDescription = "<b>All approvals have been received!</b><br />Your order is ready to move to production.";
            break;

          case 4:
            this.orderDetail.strReturn.statusID = 4;
            this.orderDetail.strReturn.statusName = "In Production";
            this.orderDetail.strReturn.statusDescription = "<b>Your art approval has been received!</b><br />We are now waiting for the next approver to submit their response to the artwork proof.";
            break;

          case 5:
            this.orderDetail.strReturn.statusID = 5;
            this.orderDetail.strReturn.statusName = "Estimated Ship Date Scheduled";
            this.orderDetail.strReturn.statusDescription = "<b>An estimated ship date has been scheduled!</b><br />Estimated ship date(s) are available.";
            break;

          case 6:
            this.orderDetail.strReturn.statusID = 6;
            this.orderDetail.strReturn.statusName = "Shipped";
            this.orderDetail.strReturn.statusDescription = "<b>Your order is complete!</b><br />Thank you for your business.";
            break;
        }
      } else {
        this.qryTrackerArray.push(
          { value: 1, status: 'Art Proof Sent' },
          { value: 2, status: 'All Approvals Received' },
          { value: 3, status: 'In Production' },
          { value: 4, status: 'Estimated Ship Date Scheduled' },
          { value: 5, status: 'Shipped' },
          // { value: 6, value: 'Delivery Confirmation' } 
        );
        switch (qryOrderStatusTemp[0].statusID) {
          case 0:
            this.orderDetail.strReturn = {
              statusID: 0,
              statusName: 'Order Created',
              statusDescription: "<b>Your Order Has Been Created!</b><br />You will receive an artwork proof within 24 hours."
            };
            break;

          case 1:
            this.orderDetail.strReturn = {
              statusID: 1,
              statusName: 'Art Proof Sent',
              statusDescription: "<b>An artwork proof has been sent!</b><br />An artwork proof is awaiting approval."
            };
            break;

          case 2:
            this.orderDetail.strReturn = {
              statusID: 2,
              statusName: 'All Approvals Received',
              statusDescription: "<b>All approvals have been received!</b><br />All approvals have been received and we are ready to send to production as long as payment has been arranged."
            };
            break;

          case 3:
            this.orderDetail.strReturn = {
              statusID: 3,
              statusName: 'In Production',
              statusDescription: "<b>Your order is in production!</b><br />We will have shipping information available next."
            };
            break;

          case 4:
            this.orderDetail.strReturn = {
              statusID: 4,
              statusName: 'Estimated Ship Date Scheduled',
              statusDescription: "<b>An estimated ship date has been scheduled!</b><br />Your order is scheduled to ship."
            };
            break;

          case 5:
            this.orderDetail.strReturn = {
              statusID: 5,
              statusName: 'Shipped',
              statusDescription: "<b>Your order has shipped!</b><br />You order is on its way to you."
            };
            break;

          case 6:
            this.orderDetail.strReturn = {
              statusID: 6,
              statusName: 'Delivered',
              statusDescription: "<b>Deliver has been confirmed!</b><br />Thank you for your business!"
            };
            break;
        }
      }
    }
  }
}
