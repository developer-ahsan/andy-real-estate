import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrderManageService } from '../../order-manage.service';
import { HideUnhideCart, updateAttentionFlagOrder } from '../../order-manage.types';
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
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrderManageService,
    private router: Router,
    private _route: ActivatedRoute
  ) { }
  resetInit() {
    this.status = 2;
    this.store_id = 0;
    this.rangeStart = '';
    this.rangeEnd = '';
    if (this.dataSource.length > 0) {
      this.paginator.pageIndex = 0;
      this.page = 1;
    }
  }
  ngOnInit(): void {
    this._route.queryParams.subscribe(res => {
      this.userData = JSON.parse(sessionStorage.getItem('orderManage'));
      if (res?.orderID) {
        this.resetInit();
        this.customerKeyword = '';
        this.orderID = res.orderID;
      }
      if (res?.keyword) {
        this.resetInit();
        this.orderID = '';
        this.customerKeyword = res.keyword;
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
      size: 20,
      page: page,
      view_dashboard: true
    }
    this._orderService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalRecords = res["totalRecords"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getOrderManage(this.page);
  }
  filterOrderManageData() {
    if (this.dataSource.length > 0) {
      this.paginator.pageIndex = 0;
      this.page = 1;
    }
    this.isLoading = true;
    this.getOrderManage(this.page);
  }
  goToOrderDetails(item) {
    const queryParams: NavigationExtras = {
      queryParams: { fk_orderID: item.fk_orderID, pk_orderLineID: item.pk_orderLineID, pk_orderLinePOID: item.pk_orderLinePOID }
    };
    this.router.navigate(['/ordermanage/order-details'], queryParams);
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
