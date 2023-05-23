import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { retry, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html',
})

export class StoreProductsComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'name', 'vendor', 'master', 'store', 'desc', 'video', 'techno_logo'];
  dataSource = [];
  totalRecords = 0;
  totalProducts = 0;
  itemsPerPage = 5;

  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;
  isKeywordSearch: boolean = false;
  keywordSearch: string = "";

  isFilterLoader: boolean = false;
  isToggleFilter: boolean = false;

  storeCategories = [];

  keyword = '';
  category = 0;
  status = 'all';
  hasDescription = 'all';
  hasOrdered = -1;
  vendorRelation = 0;
  hasVideo = 'all';
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.isLoading = true;
        this.getStoreCategories();
        this.getProductsByCategories(this.page);
      });
  }
  getProductsByCategories(page) {
    if (page == 1) {
      this.page = 1;
      this.isFilterLoader = true;
    }
    let params = {
      store_product: true,
      store_id: this.selectedStore.pk_storeID,
      keyword: this.keyword,
      status: this.status,
      filter_category: this.category,
      has_description: this.hasDescription,
      has_ordered: this.hasOrdered,
      vendor_relation: this.vendorRelation,
      has_video: this.hasVideo,
      size: 5,
      page: page
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.products = [];
        if (element.productsList) {
          let cat_List = element.productsList.split(',,');
          cat_List.forEach(product => {
            let data = product.split('==');
            element.products.push({
              spid: data[0],
              name: data[1],
              vendor: data[2],
              relation: data[3],
              date: data[4],
              master: data[5],
              store: data[6],
              desc: data[7],
              image: data[8],
              video: data[9],
              colors: data[10],
              logo: data[11],
              o: data[12],
            })
          });
        }
      });
      this.dataSource = res["data"];
      this.totalRecords = res["categoryCount"];
      this.totalProducts = res["totalRecords"];
      this.isLoading = false;
      this.isFilterLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFilterLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextPrductData(event) {
    this.page = event;
    this.isLoading = true;
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.getProductsByCategories(this.page);
  };
  getStoreCategories() {
    let params = {
      category: true,
      store_id: this.selectedStore.pk_storeID,
      size: 100
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeCategories = res["data"];
    });
  }
  // getNextData() {
  //   this.page++;
  //   this.isLoadMore = true;
  //   this.getProducts(this.page);
  // };
  toggleFilter() {
    this.isToggleFilter = !this.isToggleFilter;
  }
  getFirstCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the store products
    this._storeManagerService.getStoreProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll), retry(3))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        // this.getMainStoreCall(1);
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the store products
    this._storeManagerService.getStoreProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        this.getMainStoreCall(1);
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;
    this.keywordSearch = "";

    // Mark for check
    this._changeDetectorRef.markForCheck();
  };

  searchStoreProduct(event): void {
    const { pk_storeID } = this.selectedStore;

    let keyword = event.target.value ? event.target.value : '';
    this.keywordSearch = keyword;

    if (this.keywordSearch) {
      this.isKeywordSearch = true;
      this._storeManagerService.getStoreProductsByKeywords(pk_storeID, keyword)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          this.dataSource = response["data"];
          this.dataSourceTotalRecord = response["totalRecords"];
          this.isKeywordSearch = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.isKeywordSearch = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    }
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getMainStoreCall(this.page);
  };
  goToStoreProduct(item) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/apps/ecommerce/inventory/storeProduct', item.pk_storeProductID]));
    window.open(url, '_blank');
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
