import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../rapid-build.service';
import { HideUnhideCart, bulkRemoveRapidBuildEntry, updateAttentionFlagOrder } from '../../rapid-build.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { Sort } from '@angular/material/sort';
@Component({
  selector: 'app-image-management',
  templateUrl: './image-management.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class RapidImageManagementComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  isLoading: boolean = false;
  mainScreen = 'Artwork Approved';
  dataSource = [];
  displayedColumns: string[] = ['pk_rapidBuildID', 'Status', 'age', 'fk_storeProductID', 'productNumber', 'productName', 'companyName', 'Store', 'proof', 'action'];
  totalRecords = 20;
  page = 1;

  parameters: any;
  userData: any;

  isRemoveLoader: boolean = false;
  // Statuses
  allStatus = [];
  ngStatus = 0;
  ngProductName = '';
  ngKeyword = '';
  allStores: any = [];
  selectedStore: any;
  sortOrder = '';
  sortBy = '';
  isSortingLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _RapidBuildService: RapidBuildService,
    private router: Router,
    private _route: ActivatedRoute,
    public _commonService: DashboardsService,

  ) { }
  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem('rapidBuild'));
    this._commonService.storesData$
      .pipe(
        takeUntil(this._unsubscribeAll),
        map(res => res["data"].filter(element => element.blnActive))
      )
      .subscribe(filteredData => {
        this.allStores.push({ storeName: 'All Stores', pk_storeID: 0 });
        this.allStores.push(...filteredData);
        this.selectedStore = this.allStores[0];
      });
    this._RapidBuildService.rapidBuildStatuses$.pipe(takeUntil(this._unsubscribeAll)).subscribe(statuses => {
      this.allStatus.push({ statusName: 'All statuses', pk_statusID: 0 });
      this.allStatus = this.allStatus.concat(statuses['data']);
    });
    this._route.queryParams.subscribe(res => {
      if (this.dataSource.length > 0) {
        this.paginator.pageIndex = 0;
        this.page = 1;
      }
      if (res) {
        this.parameters = res;
      }
      this.isLoading = true;
      this.getRapidBuildData(1);
    });
  };
  getRapidBuildData(page) {
    let status = 0;
    if (this.parameters.status) {
      status = this.parameters.status;
    }
    let store_id = 0;
    if (this.parameters.store_id) {
      store_id = this.parameters.store_id;
    }
    let productName = '';
    if (this.parameters.productName) {
      productName = this.parameters.productName;
    }
    let keyword = '';
    if (this.parameters.keyword) {
      keyword = this.parameters.keyword;
    }
    let params = {
      store_list: this.userData.storesList.replace(/ /g, ''),
      status: status,
      store_id: store_id,
      productName: productName,
      keyword: keyword,
      size: 20,
      sort_order: this.sortOrder,
      sort_by: this.sortBy,
      page: page,
      rapidbuild_list: true
    }
    this._RapidBuildService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.isChecked = false;
        element.Age = this._commonService.convertHoursToDays(element.AgeInHours);
      });
      this.dataSource = res["data"];
      this.totalRecords = res["totalRecords"];
      this.isLoading = false;
      this.isSortingLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSortingLoader = false;
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
    this.getRapidBuildData(this.page);
  }
  sortData(sort: Sort) {
    this.isSortingLoader = true;
    this.sortBy = sort.active;
    if (sort.direction == '') {
      sort.direction = 'asc';
    }
    this.sortOrder = sort.direction;
    this.page = 1;
    this.getRapidBuildData(1);
  };
  goToDetailPage(item) {
    const queryParams: NavigationExtras = {
      queryParams: { fk_orderID: item.fk_orderID, pk_orderLineID: item.pk_orderLineID, store_id: item.pk_storeID }
    };
    this.router.navigate([`/rapidbuild/rapidBuild-details/${item.pk_rapidBuildID}/${item.pk_storeID}`]);
  }
  changeCheckbox(item, checked) {
    item.isChecked = checked;
  }
  removeBulkBuilds() {
    let data = [];
    this.dataSource.forEach(element => {
      if (element.isChecked) {
        data.push(element.pk_rapidBuildID);
      }
    });
    this.isRemoveLoader = true;
    let payload: bulkRemoveRapidBuildEntry = {
      rbid: data.toString(),
      bulk_remove_rapidbuild_entry: true
    };
    this._RapidBuildService.UpdateAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._RapidBuildService.snackBar(res["message"]);
      this.isRemoveLoader = false;
      if (this.dataSource.length > 0) {
        this.paginator.pageIndex = 0;
        this.page = 1;
      }
      this.isLoading = true;
      this.getRapidBuildData(1);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRemoveLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  filterBuildData() {
    let store_id = 0;
    if (this.selectedStore) {
      store_id = this.selectedStore.pk_storeID;
    }
    const queryParams: NavigationExtras = {
      queryParams: { status: this.ngStatus, store_id: store_id, productName: this.ngProductName, keyword: this.ngKeyword }
    };
    // this.toggleDrawer();
    this.router.navigate(['rapidbuild/image-management'], queryParams);
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
