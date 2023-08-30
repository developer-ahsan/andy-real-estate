import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
@Component({
  selector: 'app-ordermanage-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class OrderManageDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) sidenav: MatDrawer;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  // Sidebar stuff
  @ViewChild('drawer') drawer: MatDrawer;
  drawerMode: 'over' | 'side' = 'over';


  mainScreen = 'Artwork Approved';
  dataSource = [];
  displayedColumns: string[] = ['date', 'esd', 'inhands', 'order', 'po', 'customer', 'product', 'vendor', 'status', 'store', 'paid', 'trx', 'action'];
  totalRecords = 0;
  page = 1;

  userID: any;
  status = 2;
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
    { value: 1, label: 'New Order' },
    { value: 2, label: 'Artwork Approved' },
    { value: 3, label: 'PO Sent' },
    { value: 4, label: 'PO Acknowledged' },
    { value: 5, label: 'Shipped' },
    { value: 6, label: 'Delivered' },
    { value: 8, label: 'Picked up' },
    { value: 9, label: 'Backorder' },
    { value: 16, label: 'Not on backorder' },
    { value: 10, label: 'Waiting For GroupBuy' },
    { value: 11, label: 'Hidden' },
    { value: 12, label: 'Unhidden' },
    { value: 14, label: 'Semi-rush' },
    { value: 15, label: 'Un-semi-rush' }
  ];
  isPaginatedLoader: boolean = false;
  @ViewChild('tableTop') tableTop: ElementRef;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrderManageService,
    private router: Router,
    private _route: ActivatedRoute
  ) { }
  resetInit() {
    this.status = 2;
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
    });

  };
  toggleDrawer() {
    this.sidenav.toggle();
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
      size: 20,
      page: page,
      view_dashboard: true
    }
    this._orderService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.styles = this.getRowStyles(element);
      });
      this.dataSource = res["data"];
      console.log(this.dataSource);
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
  goToOrderDetails(item) {
    const queryParams: NavigationExtras = {
      queryParams: { fk_orderID: item.fk_orderID, pk_orderLineID: item.pk_orderLineID, pk_orderLinePOID: item.pk_orderLinePOID }
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

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
