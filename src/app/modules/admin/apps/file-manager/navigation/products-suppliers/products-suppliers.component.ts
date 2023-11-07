import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-products-suppliers',
  templateUrl: './products-suppliers.component.html'
})

export class ProductsSuppliersComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['pid', 'spid', 'sid', 'name', 'master', 'store'];
  dataSource = [];
  dataCount= [];
  totalRecords = 0;
  totalProducts = 0;
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;
  itemsPerPage = 5;

  keywordSearch: string = "";
  isKeywordSearch: boolean = false;
  suppliers = [];

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
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
        this.getProductsBySuppliers(1);
      });
  }

  getProductsBySuppliers(page) {
    let params = {
      supplier_products: true,
      keyword: this.keywordSearch,
      store_id: this.selectedStore.pk_storeID,
      size: 5,
      page: page
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.products = [];
        if (element.productDetails) {
          let cat_List = element.productDetails.split(',,');
          cat_List.forEach(product => {
            let data = product.split(':');
            element.products.push({
              pid: data[0],
              spid: data[1],
              sid: data[2],
              product: data[3],
              master: data[4],
              store: data[5]
            })
          });
        }
      });
      this.dataSource = res["data"];
      this.dataCount = res["counts"];
      if (this.duplicatedDataSource.length == 0) {
        this.duplicatedDataSource = res["data"];
        this.dataSourceTotalRecord = res["totalRecords"];
      }
      this.totalRecords = res["totalRecords"];
      this.totalProducts = res["totalRecords"];
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
    this.getProductsBySuppliers(this.page);
  };
  getProductsSearchByKeyword() {
    this.page = 1;
    let params = {
      supplier_products: true,
      keyword: this.keywordSearch,
      store_id: this.selectedStore.pk_storeID,
      size: 5,
      page: 1
    }
    this.isKeywordSearch = true;
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.products = [];
        if (element.productDetails) {
          let cat_List = element.productDetails.split(',,');
          cat_List.forEach(product => {
            let data = product.split(':');
            element.products.push({
              pid: data[0],
              spid: data[1],
              sid: data[2],
              product: data[3],
              master: data[4],
              store: data[5]
            })
          });
        }
      });
      this.dataSource = res["data"];
      this.totalRecords = res["totalRecords"];
      this.isKeywordSearch = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isKeywordSearch = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  getFirstCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the supplier products
    this._storeManagerService.getProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        this.getFirstCall(1);
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the supplier products
    this._storeManagerService.getProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.dataSource = [];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
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



  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;
    this.totalRecords = this.dataSourceTotalRecord;
    this.page = 1;
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
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}


