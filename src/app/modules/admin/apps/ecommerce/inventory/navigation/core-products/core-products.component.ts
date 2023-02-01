import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors, AvailableCores, SubCategories, Categories } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-core-products',
  templateUrl: './core-products.component.html'
})
export class CoreProductsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['core', 'category', 'sub_category'];
  flashMessage: 'success' | 'error' | null = null;
  dataSource: Colors[] = [];
  selection;
  selectedorder: string = 'select_order';
  products: string[] = [
    'YES',
    'NO'
  ];
  available_cores: AvailableCores[] = [];
  categories: Categories[] = [];
  subCategory: SubCategories[] = [];

  selectedCore = null;
  selectedCategory = null;
  selectedSubCategory = null;

  isCategory = false;
  isSubCategory = false;
  coreAddLoader = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.getProductDetail();
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getCoreProducts();
      }
    });
  }
  getCoreProducts() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getCoresByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cores) => {
        this._inventoryService.getAvailableCoresProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((available_core) => {
            this.available_cores = available_core["data"];
            this.dataSource = cores["data"];
            this.isLoading = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.isLoading = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
          });

      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isLoading = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  uploadImage(): void {
  }

  coreSelection(cores): void {
    const { pk_coreID } = cores;
    this.selectedCore = cores;
    this._inventoryService.getCategoriesByCoreId(pk_coreID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((categories) => {
        this.categories = categories["data"];

        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  categorySelection(category): void {
    const { pk_categoryID } = category;
    this.selectedCategory = category;
    this._inventoryService.getSubCategoriesByCoreId(pk_categoryID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((subCategories) => {
        this.subCategory = subCategories["data"];

        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  subCategorySelection(subCategory): void {
    this.selectedSubCategory = subCategory;
  }

  addCore(): void {
    const { pk_subCategoryID } = this.selectedSubCategory;
    const { pk_productID } = this.selectedProduct;
    const payload = {
      product_id: pk_productID,
      sub_category_id: pk_subCategoryID,
      core: true
    }
    this.coreAddLoader = true;
    this._inventoryService.addCore(payload)
      .subscribe((response) => {
        this._inventoryService.getCoresByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((cores) => {
            this.coreAddLoader = false;
            this.showFlashMessage(
              response["success"] === true ?
                'success' :
                'error'
            );
            this.dataSource = cores["data"];
            this._snackBar.open("Cores list updated", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });

            this.selectedSubCategory = "";
            this.selectedCategory = "";
            this.selectedCore = "";

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.coreAddLoader = false;

            this.selectedSubCategory = "";
            this.selectedCategory = "";
            this.selectedCore = "";

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.coreAddLoader = false;

        this.selectedSubCategory = "";
        this.selectedCategory = "";
        this.selectedCore = "";
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
 * Show flash message
 */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
