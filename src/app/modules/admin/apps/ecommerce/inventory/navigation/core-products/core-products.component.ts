import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors, AvailableCores, SubCategories, Categories } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';

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
  dataSource = [];
  coreProducts = [];
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

  isProductLoading: boolean = false;

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
    let params = {
      core: true,
      products: true,
      product_id: pk_productID
    }
    this._inventoryService.getProductsData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cores) => {
        this._inventoryService.getAvailableCoresProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((available_core) => {
            this.available_cores = available_core["data"];
            this.coreProducts = cores["data"];
            this.isLoading = false;
            this.selectedCategory = null;
            this.selectedCore = null;
            this.dataSource = [];
            this.selectedSubCategory = null;
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
  getAvailableCoresProductId() {

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
    console.log(subCategory)
    this.selectedSubCategory = subCategory;
    this.isProductLoading = true;
    this._changeDetectorRef.markForCheck();
    this.getCoreProductsData();
  }

  getCoreProductsData() {
    let params = {
      core_sub_category_products: true,
      sub_category_id: this.selectedSubCategory.pk_subCategoryID
    }
    this._inventoryService.getProductsData(params).subscribe(res => {
      res["data"].forEach(products => {
        products.imgUrl = environment.assetsURL + `globalAssets/Products/HiRes/${products.storeProductID}.jpg`
        products.cost = 0;
        products.imprints = [];
        if (products.imprintDetails) {
          const imprints = products.imprintDetails.split(',,');
          imprints.forEach(imprint => {
            const [name, price] = imprint.split('::');
            products.imprints.push({ name, price: Number(price) });
          });
        }
        if (products.costDetails) {
          const costs = products.costDetails.split('::');
          const [qty, price] = costs[0].split(',');
          products.cost = Number(price);
        }
      });
      this.dataSource = res["data"];
      this.isProductLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  cancelCore() {
    this.selectedCategory = null;
    this.selectedCore = null;
    this.selectedSubCategory = null;
    this.dataSource = [];
  }
  addCore(): void {
    if (!this.selectedSubCategory) {
      this._snackBar.open("Please select a subcategory to add this product to.", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
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
        this.getCoreProducts();
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this._snackBar.open(response["message"], '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.coreAddLoader = false;
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
