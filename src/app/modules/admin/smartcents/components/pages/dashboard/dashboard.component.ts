import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../smartcents.service';
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
  userData: any;

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
      this.isLoading = false;
      // this.getRapidBuildData(1);
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
    console.log(item)
    const queryParams: NavigationExtras = {
      queryParams: { fk_orderID: item.fk_orderID, pk_orderLineID: item.pk_orderLineID }
    };
    this.router.navigate([`/rapidbuild/rapidBuild-details/${item.pk_rapidBuildID}`]);
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