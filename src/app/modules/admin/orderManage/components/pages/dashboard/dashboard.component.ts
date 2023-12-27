import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
import { updateOrderManageBulkStatusUpdate } from '../../order-manage.types';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-ordermanage-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class OrderManageDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  mainScreen = 'Artwork Approved';
  dataSource = [];
  totalRecords = 0;
  page = 1;

  userID: any;
  status = 0;
  store_id = 0;
  rangeStart: any = '';
  rangeEnd: any = '';
  customerKeyword = '';
  orderID: any = '';
  ngstatusID = 1;
  userData: any;
  sort_by = '';
  sort_order = ''
  statusOptions = [
    { pk_statusID: 1, statusName: 'New Order' },
    { pk_statusID: 2, statusName: 'Artwork Approved' },
    { pk_statusID: 3, statusName: 'PO Sent' },
    { pk_statusID: 4, statusName: 'PO Acknowledged' },
    { pk_statusID: 5, statusName: 'Shipped' },
    { pk_statusID: 6, statusName: 'Delivered' },
    { pk_statusID: 8, statusName: 'Picked up' },
    { pk_statusID: 9, statusName: 'Backorder' },
    { pk_statusID: 16, statusName: 'Not on backorder' },
    { pk_statusID: 10, statusName: 'Waiting For GroupBuy' },
    { pk_statusID: 11, statusName: 'Hidden' },
    { pk_statusID: 12, statusName: 'Unhidden' },
    { pk_statusID: 14, statusName: 'Semi-rush' },
    { pk_statusID: 15, statusName: 'Un-semi-rush' },
  ];

  isPaginatedLoader: boolean = false;
  @ViewChild('tableTop') tableTop: ElementRef;

  ngBackDate: any;
  isUpdateBulkLoader: boolean = false;
  allStatus = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrderManageService,
    private _commonService: DashboardsService,
    private router: Router,
    private _route: ActivatedRoute
  ) { }
  resetInit() {
    this.status = 0;
    this.store_id = 0;
    this.orderID = '';
    this.rangeStart = '';
    this.rangeEnd = '';
    this.customerKeyword = '';
    if (this.dataSource.length > 0) {
      this.paginator.pageIndex = 0;
      this.page = 1;
    }
  }
  ngOnInit(): void {
    this._route.queryParams.subscribe(res => {
      this.userData = JSON.parse(sessionStorage.getItem('orderManage'));
      this.resetInit();
      const parameterMappings = {
        orderID: 'orderID',
        keyword: 'customerKeyword',
        status: 'status',
        storeID: 'store_id',
        range_start: 'rangeStart',
        range_end: 'rangeEnd'
      };
      for (const [param, property] of Object.entries(parameterMappings)) {
        if (res[param]) {
          this[property] = res[param];
        }
      }
      this.isLoading = true;
      this.getOrderManage(1);
      this.getStatus();
    });

  };
  getStatus() {
    this._orderService.orderManageStatus$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStatus = res["data"];
    });
  }
  getOrderManage(page) {
    let params = {
      user_id: this.userData.pk_userID,
      status: this.status,
      store_id: this.store_id,
      orderID: this.orderID,
      customer_keyword: this.customerKeyword,
      range_start: this.rangeStart,
      range_end: this.rangeEnd,
      sort_by: this.sort_by,
      sort_order: this.sort_order,
      bln_fulfillment: this.userData.blnFulfillment,
      size: 30,
      page: page,
      view_dashboard: true
    }
    this._orderService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.fileLoader = true;
        element.checked = false;
        element.prducts = [];
        if (element.productName) {
          element.prducts = element.productName.split(',');
        }
        element.age = this._commonService.convertMinutesToDaysAndHours(element.Age);
        element.styles = this.getRowStyles(element);
      });
      this.dataSource = res["data"];
      this.getFilesData();
      this.totalRecords = res["totalRecords"];
      if (this.isPaginatedLoader) {
        this.backtoTop();
      }
      this.isPaginatedLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isPaginatedLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    this.isPaginatedLoader = true;
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getOrderManage(this.page);
  }
  getFilesData() {
    const payload = this.dataSource.map(element => ({
      ID: element.fk_orderLineID,
      path: `/artwork/POProof/${element.fk_orderLineID}/`,
    }));

    this._orderService.getMultipleFilesData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (element.data.length) {
          const foundItem = this.dataSource.find(item => item.fk_orderLineID === element.orderLineID);
          if (foundItem) {
            foundItem.fileProof = `https://assets.consolidus.com/artwork/POProof/${foundItem.fk_orderLineID}/${element.data?.[0]?.FILENAME || ''}`;
            this._changeDetectorRef.markForCheck();
          }
        }
      });
    });
  }
  goToOrderDetails(item) {
    const queryParams: NavigationExtras = {
      queryParams: { fk_orderID: item.pk_orderID, pk_orderLineID: item.fk_orderLineID, pk_orderLinePOID: item.pk_orderLinePOID }
    };
    this.router.navigate(['/ordermanage/order-details'], queryParams);
  }

  getRowStyles(qryDashboardData: any) {
    const styles: { [key: string]: any } = {};

    if (qryDashboardData.inHandsDate) {
      styles['border'] = '3px solid #d9534f';
    }
    if (qryDashboardData.blnSample) {
      styles['background-color'] = '#feee84';
    } else if (qryDashboardData.fk_orderLineID && qryDashboardData.blnWarehouse) {
      styles['background-color'] = '#5ed0ff';
    } else if (qryDashboardData.fk_orderLineID && !qryDashboardData.orderLineImprintsCount) {
      styles['background-color'] = '#d9b5f4';
    } else if (qryDashboardData.blnBackorder) {
      styles['background-color'] = '#00d7c0';
    } else if (qryDashboardData.fk_orderLineID && qryDashboardData.blnGroupRun) {
      styles['background-color'] = '#ADFFB6';
    } else if (qryDashboardData.fk_groupOrderID) {
      styles['background-color'] = '#fca769';
    } else if (qryDashboardData.blnDuplicated) {
      styles['background-color'] = '#4512de';
      styles['color'] = '#ffffff';
    }

    return styles;
  }
  backtoTop() {
    setTimeout(() => {
      this.tableTop.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  customSort(event) {
    this.sort_by = event.active;
    this.sort_order = event.direction;
    if (this.dataSource.length > 0) {
      this.paginator.pageIndex = 0;
      this.page = 1;
    }
    this.isPaginatedLoader = true;
    this.getOrderManage(1);
  }


  // Bulk Update
  bulkUpdateStatus() {
    const checkedOrders = [];
    this.dataSource.forEach(element => {
      if (element.checked) {
        checkedOrders.push({
          orderLine_id: element.fk_orderLineID,
          blnGroupRun: element.blnGroupRun,
          pk_orderLinePOID: element.pk_orderLinePOID,
          product_id: element.pk_productID,
          productNumber: element.productNumber,
          orderID: element.pk_orderID
        })
      }
    });
    if (checkedOrders.length == 0) {
      this._orderService.snackBar('Please select atleast one order');
      return;
    }
    this.isUpdateBulkLoader = true;
    let payload: updateOrderManageBulkStatusUpdate = {
      status_id: this.ngstatusID,
      poOrders: checkedOrders,
      backorderDate: this.ngBackDate ? moment(this.ngBackDate).format('L') : this.ngBackDate,
      orderManageLoggedInUserName: this.userData.firstName + ' ' + this.userData.lastName,
      orderManageUserID: Number(this.userData.pk_userID),
      update_orderManage_bulk_status: true
    }
    this._orderService.PutAPIData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateBulkLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._orderService.snackBar(res["message"]);
        this.isLoading = true;
        this.getOrderManage(1);
      }
    })
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
