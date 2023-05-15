import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartCentsService } from '../../smartcents.service';
import { HideUnhideCart, updateAttentionFlagOrder } from '../../smartcents.types';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class SmartCentsDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  mainScreen = 'Artwork Approved';
  dataSource = [];
  displayedColumns: string[] = ['ID', 'Status', 'SPID', 'PID', 'Product', 'Supplier', 'Store', 'proof', 'action'];
  totalRecords = 20;
  page = 1;

  parameters: any;


  dashboardValues: any;
  // Order Type 1
  revenueData = [];
  revenueColumns: string[] = ['date', 'status', 'order', 'company', 'location', 'amount', 'pm', 'am', 'd'];
  revenueTotalRecords = 0;
  revenuePage = 1;
  // Order Type 2
  orderCloseData = [];
  orderCloseColumns: string[] = ['date', 'status', 'order', 'company', 'location', 'amount', 'pm', 'am', 'd'];
  orderCloseTotalRecords = 0;
  orderClosePage = 1;
  // Order Type 3
  posBillData = [];
  posBillColumns: string[] = ['date', 'status', 'store', 'po', 'vendor', 'esd', 'amount', 'action'];
  posBillTotalRecords = 0;
  posBillPage = 1;
  // Order Type 4
  receivePaymentData = [];
  receivePaymentColumns: string[] = ['date', 'status', 'order', 'company', 'location', 'amount', 'bd', 'po', 'acc', 'sabo', 'action'];
  receivePaymentTotalRecords = 0;
  receivePaymentPage = 1;
  // Order Type 5
  vendorBillsData = [];
  vendorBillsColumns: string[] = ['date', 'status', 'po', 'vin', 'vendor', 'esd', 'amount', 'net', 'payment', 'action'];
  vendorBillsTotalRecords = 0;
  vendorBillsPage = 1;

  orderType = 2;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartCentService: SmartCentsService,
    private router: Router,
    private _route: ActivatedRoute

  ) { }
  ngOnInit(): void {
    this._route.queryParams.subscribe((res: any) => {
      if (this.revenueData.length > 0 || this.orderCloseData.length > 0 || this.posBillData.length > 0 || this.receivePaymentData.length > 0 || this.vendorBillsData.length > 0) {
        this.paginator.pageIndex = 0;
        this.page = 1;
      }
      if (res) {
        if (res.order_type) {
          this.orderType = res.order_type;
        }
        this.parameters = res;
      }
      this.isLoading = true;
      this.getSmartCentsData(1);
    });
  };
  getSmartCentsData(page) {
    let orderKeyword = '';
    if (this.parameters.keyword) {
      orderKeyword = this.parameters.keyword;
    }
    let customer = '';
    if (this.parameters.company_keyword) {
      customer = this.parameters.company_keyword;
    }
    let start_date = '';
    if (this.parameters.start_date) {
      start_date = this.parameters.start_date;
    }
    let end_date = '';
    if (this.parameters.end_date) {
      end_date = this.parameters.end_date;
    }
    let status = 0;
    if (this.parameters.status) {
      status = this.parameters.status;
    }
    let params = {
      order_type: this.orderType,
      storeID: this.parameters.store_id,
      orderKeyword: orderKeyword,
      customer: customer,
      rangeStart: start_date,
      rangeEnd: end_date,
      status: status,
      size: 20,
      page: page,
      list: true
    }
    this._smartCentService.getApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (this.orderType == 1) {
        this.revenueData = res["data"];
        this.revenueTotalRecords = res["totalRecords"];
      } else if (this.orderType == 2) {
        this.orderCloseData = res["data"];
        this.orderCloseTotalRecords = res["totalRecords"];
      } else if (this.orderType == 3) {
        this.posBillData = res["data"];
        this.posBillTotalRecords = res["totalRecords"];
      } else if (this.orderType == 4) {
        this.receivePaymentData = res["data"];
        this.receivePaymentTotalRecords = res["totalRecords"];
      } else if (this.orderType == 5) {
        this.vendorBillsData = res["data"];
        this.vendorBillsTotalRecords = res["totalRecords"];
      }
      this.dashboardValues = res["qrySums"][0];
      if (this.orderType == 2 || this.orderType == 4 || this.orderType == 1) {
        this.dashboardValues["projectedMargin"] = (Number(this.dashboardValues["totalPrice"] - this.dashboardValues["totalCost"]) / this.dashboardValues["totalPrice"]) * 100;
        this.dashboardValues["ActualMargin"] = (Number(this.dashboardValues["totalPrice"] - this.dashboardValues["totalActualCost"]) / this.dashboardValues["totalPrice"]) * 100;
        this.dashboardValues["DifferenceMargin"] = this.dashboardValues["ActualMargin"] - this.dashboardValues["projectedMargin"];
      }
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
    this.getSmartCentsData(this.page);
  }
  goToDetailPage(item) {
    // const queryParams: NavigationExtras = {
    //   queryParams: { fk_orderID: item.fk_orderID, pk_orderLineID: item.pk_orderLineID }
    // };
    this.router.navigate([`/smartcents/smartcents-details/${item.pk_orderLinePOID}`]);
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
