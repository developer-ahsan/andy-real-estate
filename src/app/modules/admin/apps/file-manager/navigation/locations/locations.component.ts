import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})
export class LocationsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['categoryName', 'isRecommended', 'isBestSeller', 'isTopRated', 'subCategories'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  paginatedLoading: boolean = false;

  subCategoriesLoader = false;
  subCategories = [];
  selectedCategory = null;

  activeProductsSum;
  productsCount;
  isAddLocation: boolean = false
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getLocations();
    this.isLoadingChange.emit(false);
  };

  getLocations() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_locations: true
    }
    // Get the offline products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.paginatedLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._fileManagerService.getStoreCategory(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;
        this.paginatedLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.dataSourceLoading = false;
        this.paginatedLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;

    // Mark for check
    this._changeDetectorRef.markForCheck();
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    this.paginatedLoading = true;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getMainStoreCall(this.page);
  };

  /**
     * Close the details
     */
  closeDetails(): void {
    this.selectedCategory = null;
  }

  openedAccordion(data): void {
    const { pk_attributeID, attributeName } = data;

    // If the customer is already selected...
    if (this.selectedCategory && this.selectedCategory.pk_attributeID === pk_attributeID) {
      // Close the details
      this.closeDetails();
      return;
    };


    this.selectedCategory = data;

    this.subCategoriesLoader = true;

    let params = {
      store_id: this.selectedStore.pk_storeID,
      store_locations: true,
      sub_locations: attributeName
    }
    // Get the offline products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.subCategories = response["data"];
        this.subCategoriesLoader = false;
        this.paginatedLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    // Get the offline products
    // this._fileManagerService.getStoreSubCategory(pk_categoryID)
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((response: any) => {
    //     this.subCategories = response["data"];
    //     this.subCategoriesLoader = false;

    //     if (this.subCategories.length) {
    //       this.activeProductsSum = this.subCategories.map(item => item.activeProductCount).reduce((prev, next) => prev + next);
    //       this.productsCount = this.subCategories.map(item => item.productCount).reduce((prev, next) => prev + next);
    //     };

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    //   }, err => {
    //     this._snackBar.open("Some error occured", '', {
    //       horizontalPosition: 'center',
    //       verticalPosition: 'bottom',
    //       duration: 3500
    //     });
    //     this.subCategories = [];
    //     this.subCategoriesLoader = false;

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    //   });
  }

  toggleAddLocation() {
    this.isAddLocation = !this.isAddLocation;
  }

}
