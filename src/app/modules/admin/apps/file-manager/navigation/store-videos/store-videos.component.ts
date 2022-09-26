import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-store-videos',
  templateUrl: './store-videos.component.html'
})
export class StoreVideosComponent implements OnInit, OnDestroy {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['pid', 'product_number', 'product_name', 'vendor', 'status'];
  dataSource = [];
  duplicatedDataSource = [];
  productLevelTotalVideos: number;
  dataSourceLoading = false;

  dataSource2 = [];
  duplicatedDataSource2 = [];
  storeProductLevelVideos: number;
  dataSourceLoading2 = false;

  page: number = 1;
  page2: number = 1;

  screens: string[] = [
    "Product-Level Videos",
    "Store-Product-Level Videos"
  ];
  mainScreen: string = "Product-Level Videos";

  isKeywordSearch: boolean = false;
  keywordSearch: string = "";

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getFirstCall(1);
    this.isLoadingChange.emit(false);
  }

  calledScreen(screenName): void {
    this.mainScreen = screenName;

    if (screenName == "Store-Product-Level Videos") {
      this.dataSourceLoading2 = true;
      this.getStoreProductVideos();
    } else {
      this.resetSearch();
    }
  };

  getStoreProductVideos(): void {
    const { pk_storeID } = this.selectedStore;

    if (!this.dataSource2.length) {

      // Get the supplier products
      this._fileManagerService.getStoreProductLevelVideos(pk_storeID, 1)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          this.dataSource2 = response["data"];
          this.duplicatedDataSource2 = this.dataSource;
          this.storeProductLevelVideos = response["totalRecords"];
          this.dataSourceLoading2 = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {

          // Recall on error
          this.getStoreProductVideos();
          this.dataSourceLoading = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    }
  };

  getFirstCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the supplier products
    this._fileManagerService.getStoreVideos(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.productLevelTotalVideos = response["totalRecords"];
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

    // Get the products videos
    this._fileManagerService.getStoreVideos(pk_storeID, page)
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
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getMainStoreProductCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the products videos
    this._fileManagerService.getStoreProductLevelVideos(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource2 = response["data"];
        this.dataSourceLoading2 = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.dataSourceLoading2 = false;

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

  getNextData2(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getMainStoreProductCall(this.page2);
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
      this._fileManagerService.getOfflineProductsByKeyword(pk_storeID, keyword)
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

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }
  };
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
