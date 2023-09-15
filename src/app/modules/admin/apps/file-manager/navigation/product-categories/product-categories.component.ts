import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { DeleteSubCategory, RemoveCategory } from '../../stores.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-categories',
  templateUrl: './product-categories.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})

export class ProductCategoriesComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['categoryName', 'isRecommended', 'isBestSeller', 'isTopRated', 'subCategories', 'action'];
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

  mainScreen: string = "Categories";
  screens = [
    "Categories",
    "Add New Category",
    "Display Order",
    "Online Status"
  ];

  updateStatusLoader: boolean = false;
  updateOrderLoader: boolean = false;
  addCategoryForm: FormGroup;
  addCategoryLoader: boolean = false;
  // Edit Categories
  isEditMainCategory: boolean = false;
  mainCatData: any;
  subCatData: any;
  constructor(
    public _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._storeManagerService.isEditMainCategory = false;
    this._storeManagerService.isEditSubCategory = false;
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.dataSourceLoading = true;
        this.initialize();
        this.getFirstCall(this.page, 'get');
      });
  }
  initialize() {
    this.addCategoryForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      categoryName: new FormControl(''),
      categoryDesc: new FormControl(''),
      categoryMiniDesc: new FormControl(''),
      listOrder: new FormControl(1),
      browserTitle: new FormControl(''),
      metaDesc: new FormControl(''),
      permalink: new FormControl(''),
      blnScroller: new FormControl(true),
      add_category: new FormControl(true),
    })
  }
  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };

  getFirstCall(page, check) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._storeManagerService.getStoreCategory(pk_storeID, page, 0)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.paginatedLoading = false;
        if (check == 'status') {
          this._snackBar.open("Status updated successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.updateStatusLoader = false;
        } else if (check == 'order') {
          this._snackBar.open("Display Order updated successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.updateOrderLoader = false;
        } else if (check == 'add') {
          this._snackBar.open("Category added successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.addCategoryLoader = false;
          this.initialize();
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.getFirstCall(1, 'get');

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._storeManagerService.getStoreCategory(pk_storeID, page, 0)
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
    this._storeManagerService.getStoreSubCategory(pk_categoryID, 0)
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
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  updateOnlineStatus() {
    this.updateStatusLoader = true;
    let checkArray = []
    this.dataSource.forEach(element => {
      checkArray.push({
        status: element.blnActive,
        pk_categoryID: element.pk_categoryID
      })
    });
    let params = {
      store_id: this.selectedStore.pk_storeID,
      categories: checkArray,
      update_category_status: true
    }
    this._storeManagerService.putStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.getFirstCall(1, 'status');
        this._changeDetectorRef.markForCheck();
      }, (err => {
        this.updateStatusLoader = false;
        this._changeDetectorRef.markForCheck();
      }))
  }
  updateListOrderStatus() {
    this.updateOrderLoader = true;
    let checkArray = []
    this.dataSource.forEach(element => {
      checkArray.push({
        listOrder: element.listOrder,
        pk_categoryID: element.pk_categoryID
      })
    });
    let params = {
      store_id: this.selectedStore.pk_storeID,
      categories: checkArray,
      category_display_order: true
    }
    this._storeManagerService.putStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.getFirstCall(1, 'order');
        this._changeDetectorRef.markForCheck();
      }, (err => {
        this.updateOrderLoader = false;
        this._changeDetectorRef.markForCheck();
      }))
  }
  addNewCategory() {
    const { fk_storeID, categoryName, categoryDesc, categoryMiniDesc, listOrder, browserTitle, metaDesc, permalink, blnScroller, add_category } = this.addCategoryForm.getRawValue();
    if (categoryName == '' || permalink == '' || metaDesc == '' || categoryDesc == '') {
      this._snackBar.open("Please fill all the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    } else {
      this.addCategoryLoader = true;
      let params = {
        fk_storeID, categoryName, categoryDesc, categoryMiniDesc, listOrder, browserTitle, metaDesc, permalink, blnScroller, add_category
      }
      this._storeManagerService.postStoresData(params)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(res => {
          this.getFirstCall(1, 'add');
          this._changeDetectorRef.markForCheck();
        }, (err => {
          this.addCategoryLoader = false;
          this._changeDetectorRef.markForCheck();
        }))
    }
  }
  toggleEditMainCategory(item) {
    const category: string = JSON.stringify(item)
    localStorage.setItem('MainCategory', category);
    this._router.navigateByUrl(`/apps/stores/${this.selectedStore.pk_storeID}/product-categories/parent-categories`);
    // this.mainCatData = item;
    // this._storeManagerService.isEditMainCategory = !this._storeManagerService.isEditMainCategory;
  }
  toggleEditSubCategory(item) {
    const category: string = JSON.stringify(item)
    localStorage.setItem('SubCategory', category);
    this._router.navigateByUrl(`/apps/stores/${this.selectedStore.pk_storeID}/product-categories/child-categories`);
    // this.subCatData = item;
    // this._storeManagerService.isEditSubCategory = !this._storeManagerService.isEditSubCategory;
  }
  deleteCategory(item) {
    let payload: RemoveCategory = {
      category_id: item.pk_categoryID,
      delete_category: true
    }
    item.deleteLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      // let index = this.dataSource.findIndex(elem => elem.pk_categoryID == item.pk_categoryID);
      // console.log(index)
      // this.dataSource.splice(index, 1);
      this.dataSource = this.dataSource.filter(elem => elem.pk_categoryID != item.pk_categoryID)
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  deleteSubCategory(item) {
    let payload: DeleteSubCategory = {
      subCategoryID: item.pk_subCategoryID,
      remove_subCategory: true
    }
    item.deleteLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      let index = this.subCategories.findIndex(elem => elem.pk_subCategoryID == item.pk_subCategoryID);
      this.subCategories.splice(index, 1);
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
}
