import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { MatDrawer } from '@angular/material/sidenav';

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

  dataSource = [];
  displayedColumns: string[] = ['sales', 'qty', 'product', 'supplier', 'customer'];
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
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
    this.getSuppliers();
  };
  getStores() {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'Any Stores', pk_storeID: '' });
      this.allStores = this.allStores.concat(res["data"]);
      this.selectedStores = this.allStores[0];
      this.searchStoresCtrl.setValue(this.selectedStores);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchStoresCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          stores: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStores = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStores = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'Any Stores', pk_storeID: '' });
      this.allStores = this.allStores.concat(data["data"]);
    });
  }
  onSelectedStores(ev) {
    this.selectedStores = ev.option.value;
  }
  displayWithStores(value: any) {
    return value?.storeName;
  }
  getSuppliers() {
    // this._reportService.Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   console.log(res);
    //   if (res) {
    //     this.allSuppliers.push({ storeName: 'Any Vendor', pk_companyID: '' });
    //     this.allSuppliers = this.allSuppliers.concat(res["data"]);
    //     this.selectedSuppliers = this.allSuppliers[0];
    //     this.searchSuppliersCtrl.setValue(this.selectedSuppliers);
    //   }
    // }, err => {
    //   this.isLoading = false;
    //   this._changeDetectorRef.markForCheck();
    // });
    let param = {
      suppliers: true,
      size: 10
    }
    this._reportService.getAPIData(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allSuppliers.push({ companyName: 'Any Vendor', pk_companyID: '' });
      this.allSuppliers = this.allSuppliers.concat(res["data"]);
      this.selectedSuppliers = this.allSuppliers[0];
      this.searchSuppliersCtrl.setValue(this.selectedSuppliers);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchSuppliersCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          suppliers: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allSuppliers = [];
        this.isSearchingSuppliers = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingSuppliers = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allSuppliers.push({ companyName: 'Any Vendor', pk_companyID: '' });
      this.allSuppliers = this.allSuppliers.concat(data["data"]);
    });
  }
  onSelectedSuppliers(ev) {
    this.selectedSuppliers = ev.option.value;
  }
  displayWithSuppliers(value: any) {
    return value?.companyName;
  }
  generateReport(page) {
    if (page == 1) {
      this.page = 1;
      if (this.dataSource.length > 0) {
        this.paginator.pageIndex = 0;
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

    this.isGenerateReportLoader = true;
    let params = {
      page: page,
      best_sellers: true,
      product_type: this.productType,
      keyword: this.keyword,
      store_list: this.selectedStores.pk_storeID,
      supplier_list: this.selectedSuppliers.pk_companyID,
      start_date: start,
      end_date: end,
      size: 20
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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