import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SystemService } from '../../../system.service';
import { ActivatedRoute } from '@angular/router';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-products-core-suppliers',
  templateUrl: './products-suppliers.component.html'
})

export class CoreProductsSuppliersComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['pid', 'spid', 'sid', 'name', 'master', 'store'];
  totalRecords = 0;
  totalProducts = 0;
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;
  itemsPerPage = 10;

  keywordSearch: string = "";
  isKeywordSearch: boolean = false;
  suppliers = [];


  coreID: any;
  dataSource = [];
  partnerSuppliersCount = 0;
  preferredSuppliersCount = 0;
  productsCount = 0;
  constructor(
    private _systemService: SystemService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._activeRoute.params.subscribe(params => {
      this.coreID = params.id;
      this.isLoading = true;
      this.getSummaryData(1);
    })
  }

  getSummaryData(page) {
    let params = {
      core_summary: true,
      core_id: this.coreID,
      size: 10,
      page: page
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.productsData = [];
        if (element.products) {
          let prod_List = element.products.split(',,');
          prod_List.forEach(product => {
            let data = product.split('::');
            element.productsData.push({
              pid: data[0],
              spid: data[1],
              product: data[2]
            })
          });
        }
      });
      this.dataSource = res["data"];
      if (this.dataSource.length > 0) {
        this.productsCount = this.dataSource[0].productsCount;
      }
      if (this.duplicatedDataSource.length == 0) {
        this.duplicatedDataSource = res["data"];
        this.dataSourceTotalRecord = res["totalRecords"];
      }
      this.totalRecords = res["totalRecords"];
      this.totalProducts = res["totalRecords"];
      this.partnerSuppliersCount = res["partnerSuppliersCount"];
      this.preferredSuppliersCount = res["preferredSuppliersCount"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextProductData(event) {
    this.page = event;
    this.isLoading = true;
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.getSummaryData(this.page);
  };
  // getProductsSearchByKeyword() {
  //   this.page = 1;
  //   let params = {
  //     supplier_products: true,
  //     keyword: this.keywordSearch,
  //     store_id: this.selectedStore.pk_storeID,
  //     size: 5,
  //     page: 1
  //   }
  //   this.isKeywordSearch = true;
  //   this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
  //     res["data"].forEach(element => {
  //       element.products = [];
  //       if (element.productDetails) {
  //         let cat_List = element.productDetails.split(',,');
  //         cat_List.forEach(product => {
  //           let data = product.split(':');
  //           element.products.push({
  //             pid: data[0],
  //             spid: data[1],
  //             sid: data[2],
  //             product: data[3],
  //             master: data[4],
  //             store: data[5]
  //           })
  //         });
  //       }
  //     });
  //     this.dataSource = res["data"];
  //     this.totalRecords = res["totalRecords"];
  //     this.isKeywordSearch = false;
  //     this._changeDetectorRef.markForCheck();
  //   }, err => {
  //     this.isKeywordSearch = false;
  //     this._changeDetectorRef.markForCheck();
  //   });
  // }


  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;
    this.totalRecords = this.dataSourceTotalRecord;
    this.page = 1;
    this.keywordSearch = "";

    // Mark for check
    this._changeDetectorRef.markForCheck();
  };

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}


