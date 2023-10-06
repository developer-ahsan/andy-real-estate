import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardsService } from '../../../dashboard.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject, pipe } from 'rxjs';
import moment from 'moment';
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

  tempApprovalOrders: any;
  tempAwaitingOrders: any;
  tempProcessingOrders: any;

  approvalOrdersLoader: any;
  awaitingOrdersLoader: any;
  processingOrdersLoader: any;

  approvalOrdersStores: any;
  awaitingOrdersStores: any;
  processingOrdersStores: any;

  ngAapprovalStores: any = 'All';
  ngAwaitingStores: any = 'All';
  ngProcessingStores: any = 'All';

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

    this.tempApprovalOrders = [];
    this.tempAwaitingOrders = [];
    this.tempProcessingOrders = [];

    this.approvalOrdersStores = [];
    this.awaitingOrdersStores = [];
    this.processingOrdersStores = [];

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
          const existingStoreIndex = this.approvalOrdersStores.findIndex(store => store.store === storeName);
          if (existingStoreIndex > -1) {
            this.approvalOrdersStores[existingStoreIndex].data.push({ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority, priorityChecked });
          } else {
            this.approvalOrdersStores.push({ store: storeName, data: [{ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority, priorityChecked }] });
          }
          this.approvalOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority, priorityChecked
          });
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
          const existingStoreIndex = this.awaitingOrdersStores.findIndex(store => store.store === storeName);
          if (existingStoreIndex > -1) {
            this.awaitingOrdersStores[existingStoreIndex].data.push({ orderID: Number(orderID), orderDate, inHandsDate, blnReorder: Number(blnReorder), groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), paymentNotification, status: statusResult, days, priority, priorityChecked });
          } else {
            this.awaitingOrdersStores.push({ store: storeName, data: [{ orderID: Number(orderID), orderDate, inHandsDate, blnReorder: Number(blnReorder), groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), paymentNotification, status: statusResult, days, priority, priorityChecked }] });
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
          const existingStoreIndex = this.processingOrdersStores.findIndex(store => store.store === storeName);
          if (existingStoreIndex > -1) {
            this.processingOrdersStores[existingStoreIndex].data.push({ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority, priorityChecked });
          } else {
            this.processingOrdersStores.push({ store: storeName, data: [{ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority, priorityChecked }] });
          }
          this.processingOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority, priorityChecked
          })
        });
      }
      this.tempApprovalOrders = this.approvalOrders;
      this.tempProcessingOrders = this.processingOrders;
      this.tempAwaitingOrders = this.awaitingOrders;

      this._changeDetectorRef.markForCheck();
    })
  }
  openOrderComments(item) {
    const url = `/apps/orders/${item.storeUserID}/comments`;
    window.open(url, '_blank');
  }
  // Reschedule
  openRescheduleModal(data) {
    this.rescheduleModalContent = data;
    this.rescheduleModalContent.date = null;
    $(this.rescheduleModal.nativeElement).modal('show');
  }
  updateReschedule() {
    const { date, orderID } = this.rescheduleModalContent;
    if (!date) {
      this._dashboardService.snackBar('Date is required');
      return;
    }
    this.rescheduleModalContent.rescheduleLoader = true;
    let payload = {
      orderID: orderID,
      theDate: moment(date).format('mm/DD/yyyy'),
      reschedule_artwork: true
    }
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.rescheduleModalContent.rescheduleLoader = true;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["message"]) {
        this._dashboardService.snackBar(res["message"]);
      }
      $(this.rescheduleModal.nativeElement).modal('hide');
    });
  }
  // Update Priority
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
  changeStore(type, event) {
    if (type == 'waiting') {
      this.approvalOrdersLoader = true;
      this.approvalOrders = null;
      if (event.value == 'All') {
        this.approvalOrders = this.tempApprovalOrders;
      } else {
        const index = this.approvalOrdersStores.findIndex(store => store.store == event.value);
        this.approvalOrders = this.approvalOrdersStores[index].data;
      }
      setTimeout(() => {
        this.approvalOrdersLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    } else if (type == 'payment') {
      this.awaitingOrdersLoader = true;
      this.awaitingOrders = null;
      if (event.value == 'All') {
        this.awaitingOrders = this.tempAwaitingOrders;
      } else {
        const index = this.awaitingOrdersStores.findIndex(store => store.store == event.value);
        this.awaitingOrders = this.awaitingOrdersStores[index].data;
      }
      setTimeout(() => {
        this.awaitingOrdersLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    } else if (type == 'processing') {
      this.processingOrdersLoader = true;
      this.processingOrders = null;
      if (event.value == 'All') {
        this.processingOrders = this.tempProcessingOrders;
      } else {
        const index = this.processingOrdersStores.findIndex(store => store.store == event.value);
        this.processingOrders = this.processingOrdersStores[index].data;
      }
      setTimeout(() => {
        this.processingOrdersLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    }
  }
  trackByOrderId(index: number, item: any): string {
    return item.orderID;
  }
}
