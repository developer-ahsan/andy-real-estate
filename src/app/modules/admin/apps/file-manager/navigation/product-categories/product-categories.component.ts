import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-categories',
  templateUrl: './product-categories.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})

export class ProductCategoriesComponent implements OnInit {
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

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getFirstCall(this.page);
    this.isLoadingChange.emit(false);
  };

  getFirstCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._fileManagerService.getStoreCategory(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.paginatedLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.getFirstCall(1);

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
    const { pk_categoryID } = data;

    // If the customer is already selected...
    if (this.selectedCategory && this.selectedCategory.pk_categoryID === pk_categoryID) {
      // Close the details
      this.closeDetails();
      return;
    };


    this.selectedCategory = data;

    this.subCategoriesLoader = true;

    // Get the offline products
    this._fileManagerService.getStoreSubCategory(pk_categoryID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.subCategories = response["data"];
        this.subCategoriesLoader = false;

        if (this.subCategories.length) {
          this.activeProductsSum = this.subCategories.map(item => item.activeProductCount).reduce((prev, next) => prev + next);
          this.productsCount = this.subCategories.map(item => item.productCount).reduce((prev, next) => prev + next);
        };

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.subCategories = [];
        this.subCategoriesLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

}
