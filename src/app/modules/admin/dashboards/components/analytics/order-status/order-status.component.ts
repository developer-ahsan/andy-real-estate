import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardsService } from '../../../dashboard.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject, pipe } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-order-status-report',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss']
})
export class OrderStatusComponent implements OnInit {
  @ViewChild('rescheduleModal') rescheduleModal: ElementRef;

  @Input() userData: any;
  @Input() storesData: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  totalApporvalOrders = 0;
  approvalPage = 1;
  isApprovalLoader: boolean = false;

  approvalOrders: any;
  awaitingOrders: any;
  processingOrders: any;

  rescheduleModalContent: any;
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
          let priorityChecked = false;
          if (Number(priority) > 0) {
            priorityChecked = true;
          }
          this.approvalOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority, priorityChecked
          })
        });
      }
      // Awaiting Orders 
      if (awaitingOrderss) {
        const awaitOrders = awaitingOrderss.split(',,');
        awaitOrders.forEach(order => {
          const [orderID, orderDate, inHandsDate, blnReorder, groupOrderID, storeCode, storeName, storeUserID, storeID, firstName, lastName, locationName, companyName, total, paymentNotification, status, days, priority] = order.split('::');
          let statusResult = this._dashboardService.getStatusValue(status);
          let priorityChecked = false;
          if (Number(priority) > 0) {
            priorityChecked = true;
          }
          this.awaitingOrders.push({
            orderID: Number(orderID), orderDate, inHandsDate, blnReorder: Number(blnReorder), groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), paymentNotification, status: statusResult, days, priority, priorityChecked
          })
        });
      }
      // Processing Orders
      if (processingOrderss) {
        const Orders = processingOrderss.split(',,');
        Orders.forEach(order => {
          const [orderID, orderDate, paymentDate, inHandsDate, blnReorder, groupOrderID, storeCode, storeName, storeUserID, storeID, firstName, lastName, locationName, companyName, total, status, priority] = order.split('::');
          let statusResult = this._dashboardService.getStatusValue(status);
          let priorityChecked = false;
          if (Number(priority) > 0) {
            priorityChecked = true;
          }
          this.processingOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority, priorityChecked
          })
        });
      }
      this._changeDetectorRef.markForCheck();
    })
  }
  openOrderComments(item) {
    const url = `/apps/orders/${item.storeUserID}/comments`;
    window.open(url, '_blank');
  }
  openRescheduleModal(data) {
    console.log(data)
    this.rescheduleModalContent = data;
    $(this.rescheduleModal.nativeElement).modal('show');
  }
  updatePriority(order, type) {
    const { orderID, priorityChecked } = order;
    let payload: any;
    if (priorityChecked) {
      payload = {
        orderID: orderID,
        dashboardType: type,
        add_mark_priority: true
      }
    } else {
      payload = {
        orderID: orderID,
        dashboardType: type,
        delete_mark_priority: true
      }
    }
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { });
  }
  trackByOrderId(index: number, item: any): string {
    return item.orderID;
  }
}
