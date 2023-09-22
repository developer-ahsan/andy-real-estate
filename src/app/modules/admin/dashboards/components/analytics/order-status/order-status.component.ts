import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DashboardsService } from '../../../dashboard.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject, pipe } from 'rxjs';

@Component({
  selector: 'app-order-status-report',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss']
})
export class OrderStatusComponent implements OnInit {

  @Input() userData: any;
  @Input() storesData: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  totalApporvalOrders = 0;
  approvalPage = 1;
  isApprovalLoader: boolean = false;

  approvalOrders: any;
  awaitingOrders: any;
  processingOrders: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _dashboardService: DashboardsService,
  ) { }

  ngOnInit(): void {
    this.isApprovalLoader = true;
    this.getOrdersStatus();
  }

  getOrdersStatus() {
    this.approvalOrders = [];
    this.awaitingOrders = [];
    this.processingOrders = [];
    let params = {
      order_status_reports: true,
      email: this.userData.email,
    }
    this._dashboardService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isApprovalLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      let awaitingOrders = res["data"][0][0].awaitingArtwork;
      let processingOrderss = res["data"][2][0].stillProcessingOrders;
      let awaitingOrderss = res["data"][1][0].awaitingPayment;
      // Approval Orders
      if (awaitingOrders) {
        const artworks = awaitingOrders.split(',,');
        artworks.forEach(artwork => {
          const [orderID, orderDate, blnReorder, inHandsDate, groupOrderID, storeCode, storeName, storeUserID, storeID, statusDate, statusID, reschedule, firstName, lastName, locationName, companyName, total, artworkNotification, days, priority] = artwork.split('::');
          this.approvalOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority
          })
        });
      }
      // Awaiting Orders 
      if (awaitingOrderss) {
        const awaitOrders = awaitingOrderss.split(',,');
        awaitOrders.forEach(order => {
          const [orderID, orderDate, inHandsDate, blnReorder, groupOrderID, storeCode, storeName, storeUserID, storeID, firstName, lastName, locationName, companyName, total, paymentNotification, status, days, priority] = order.split('::');
          let statusResult = this._dashboardService.getStatusValue(status);
          this.awaitingOrders.push({
            orderID: Number(orderID), orderDate, inHandsDate, blnReorder: Number(blnReorder), groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), paymentNotification, status: statusResult, days, priority
          })
        });
      }
      // Processing Orders
      if (processingOrderss) {
        const Orders = processingOrderss.split(',,');
        Orders.forEach(order => {
          const [orderID, orderDate, paymentDate, inHandsDate, blnReorder, groupOrderID, storeCode, storeName, storeUserID, storeID, firstName, lastName, locationName, companyName, total, status, priority] = order.split('::');
          let statusResult = this._dashboardService.getStatusValue(status);
          this.processingOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority
          })
        });
      }
      console.log(this.approvalOrders);
      console.log(this.awaitingOrders);
      console.log(this.processingOrders);
      this._changeDetectorRef.markForCheck();
    })
  }
  trackByOrderId(index: number, item: any): string {
    return item.orderID;
  }
}
