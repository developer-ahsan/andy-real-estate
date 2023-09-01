import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { MatDrawer } from '@angular/material/sidenav';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-report-best-seller',
  templateUrl: './report-best-seller.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportBestSellerComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('drawer', { static: true }) sidenav: MatDrawer;

  dataSource: any;
  totalData = 0;
  page = 1;

  productType = 0;
  keyword = '';
  ngStart = '';
  ngEnd = '';

  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;

  allSuppliers = [];
  searchSuppliersCtrl = new FormControl();
  selectedSuppliers: any;
  isSearchingSuppliers = false;
  isGenerateReportLoader: boolean;

  singleItem: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStores();
    this.getSuppliers();
  };
  getStores() {
    this.commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        const activeStores = res["data"].filter(element => element.blnActive);
        this.allStores.push({ storeName: 'Any Stores', pk_storeID: '' });
        this.allStores.push(...activeStores);
        this.selectedStores = this.allStores[0];
      });
  }
  getSuppliers() {
    this.commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(suppliers => {
        const activeSuppliers = suppliers["data"].filter(element => element.blnActiveVendor);
        this.allSuppliers.push({ pk_companyID: '', companyName: 'Any Vendors' });
        this.allSuppliers.push(...activeSuppliers);
        this.selectedSuppliers = this.allSuppliers[0];
      });
  }

  generateReport(page) {
    this.isGenerateReportLoader = true;
    if (page == 1) {
      this.page = 1;
      if (this.dataSource) {
        if (this.dataSource.length > 0) {
          this.paginator.pageIndex = 0;
        }
      }
    }
    let start = '';
    let end = '';
    if (this.ngStart != '') {
      start = moment(this.ngStart).format('MM/DD/yyyy');
    }
    if (this.ngEnd != '') {
      end = moment(this.ngEnd).format('MM/DD/yyyy');
    }

    let params = {
      page: page,
      best_sellers: true,
      product_type: this.productType,
      keyword: this.keyword,
      store_id: this.selectedStores.pk_storeID,
      supplier_id: this.selectedSuppliers.pk_companyID,
      start_date: start,
      end_date: end,
      size: 50
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.isViewCustomer = false;
        element.customers = (element.CUSTOMERS || '').split(',').map(customer => {
          const [id, name] = customer.split('::');
          return { id, name };
        });
      });

      this.dataSource = res["data"];
      this.totalData = res["totalRecords"];
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextReportData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.generateReport(this.page);
  };
  clearFilters() {
    this.selectedStores = this.allStores[0];
    this.selectedSuppliers = this.allSuppliers[0];
    this.keyword = '';
    this.productType = 0;
    this.ngStart = '';
    this.ngEnd = '';
    this.generateReport(1);
  }
  getCustomers(item) {
    if (this.singleItem) {
      this.singleItem.NextLoader = true;
    } else {
      this.singleItem.Loader = true;
    }
    this.singleItem = item;
    let params = {
      best_seller_customers: true,
      product_id: item.pk_productID,
      supplier_id: item.pk_companyID,
      store_id: item.fk_storeID,
      page: this.singleItem.page
    }

    if (this.singleItem.page == 1) {
      this.singleItem.customers = [];
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        this.singleItem.customers.push(element);
      });
      this.singleItem.totalCustomers = res["totalRecords"];
      this.singleItem.Loader = false;
      this.singleItem.NextLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.singleItem.NextLoader = false;
      this.singleItem.Loader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextCustomer() {
    this.singleItem.page++;
    this.getCustomers(this.singleItem);
  }
  openSideNav(item) {
    this.singleItem = item;
    this.singleItem.page = 1;
    this.sidenav.toggle();
    this.getCustomers(this.singleItem);

  }
  closeSideNav() {
    this.singleItem = null;
    this.sidenav.toggle();
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