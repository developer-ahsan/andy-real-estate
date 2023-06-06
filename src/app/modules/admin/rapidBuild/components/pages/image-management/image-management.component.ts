import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../rapid-build.service';
import { HideUnhideCart, bulkRemoveRapidBuildEntry, updateAttentionFlagOrder } from '../../rapid-build.types';
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
  displayedColumns: string[] = ['ID', 'Status', 'SPID', 'PID', 'Product', 'Supplier', 'Store', 'proof', 'action'];
  totalRecords = 20;
  page = 1;

  parameters: any;
  userData: any;

  isRemoveLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _RapidBuildService: RapidBuildService,
    private router: Router,
    private _route: ActivatedRoute

  ) { }
  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem('rapidBuild'));
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
      store_list: this.userData.storesList,
      status: status,
      store_id: store_id,
      productName: productName,
      keyword: keyword,
      size: 20,
      page: page,
      rapidbuild_list: true
    }
    this._RapidBuildService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.isChecked = false;
      });
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
    this.getRapidBuildData(this.page);
  }
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };


}
