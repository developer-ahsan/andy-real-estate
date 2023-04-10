import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html'
})

export class StoreProductsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'name', 'vendor', 'master', 'store', 'desc', 'video', 'techno_logo'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;
  isKeywordSearch: boolean = false;
  keywordSearch: string = "";

  isFilterLoader: boolean = false;
  isToggleFilter: boolean = false;
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
        this.dataSourceLoading = true;
        this.getFirstCall(this.page);
      });
  }
  toggleFilter() {
    this.isToggleFilter = !this.isToggleFilter;
  }
  getFirstCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the store products
    this._storeManagerService.getStoreProducts(pk_storeID, page)
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
        this.getMainStoreCall(1);
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
