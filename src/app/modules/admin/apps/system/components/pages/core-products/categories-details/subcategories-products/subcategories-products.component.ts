import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SystemService } from '../../../../system.service';
import { AddColor, AddCoreCategory, AddImprintColor, AddImprintMethod, AddNewCore, AddSubCategory, DeleteColor, DeleteImprintColor, UpdateColor, UpdateCoreCategory, UpdateImprintColor, UpdateImprintMethod, UpdateProductDisplayOrder, UpdateSubCategory, addSubCategoryProduct } from '../../../../system.types';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-subcategories-products',
  templateUrl: './subcategories-products.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class SubCategoriesProductsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() paramsCatData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['category', 'subcat', 'products'];
  totalCategories = 0;
  page = 1;
  isLoadMore: boolean = false;

  mainScreen: string = 'Current Categories Lists';
  keyword = '';
  not_available = 'N/A';

  ngSubcatName: string = '';
  isAddCatLoader: boolean = false;
  isAddSubCatLoader: boolean = false;


  isSearching: boolean = false;



  coreID: any;
  // Products Dropdown
  allProducts = [];
  searchProductsCtrl = new FormControl();
  selectedProducts: any;
  isSearchingProducts = false;
  // Products Toggle
  isCatProdsEnable: boolean = false;

  ngName: string = '';
  isUpdateCategoryLoader: boolean = false;
  productsData = [];
  selectedProductsData = [];
  totalRecords = 0;

  isAddProdLoader: boolean = false;

  isDisplayOrder: boolean = false;
  productsForDisplayOrder: any;
  isUpdateDisplayLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.getAvailableProducts();
    this.isLoading = true;
    this.ngName = this.paramsCatData.name;
    this.getCategoriesProducts(1, 'get')
  };
  initialize() {
    let params;
    this.searchProductsCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          subCategory_id: Number(this.paramsCatData.sub_id),
          sub_categories_available_products: true,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allProducts = [];
        this.isSearchingProducts = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._systemService.getSystemsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingProducts = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allProducts = data['data'];
    });
  }
  onSelected(ev) {
    this.selectedProducts = ev.option.value;
    if (this.selectedProductsData.length == 0) {
      this.selectedProductsData.push(this.selectedProducts);
    } else {
      let index = this.selectedProductsData.findIndex(prod => prod.pk_productID == this.selectedProducts.pk_productID);
      if (index < 0) {
        this.selectedProductsData.push(this.selectedProducts);
      } else {
        this._systemService.snackBar('Product already listed');
      }
    }
  }
  removeProductFromList(index) {
    this.selectedProductsData.splice(index, 1);
  }
  displayWith(value: any) {
    return value?.productName;
  }
  getAvailableProducts() {
    let params = {
      subCategory_id: Number(this.paramsCatData.sub_id),
      sub_categories_available_products: true,
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allProducts = res["data"];
    })
  }
  getCategoriesProducts(page, type) {
    if (page == 1) {
      this.productsData = [];
    }
    let params = {
      page: page,
      subCategory_id: this.paramsCatData.sub_id,
      size: 10,
      sub_categories_products: true
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.productsData = [];
        if (element.products) {
          let prods = element.products.split(',,');
          prods.forEach(prod => {
            let _prod = prod.split('::');
            element.productsData.push({ name: _prod[0], id: _prod[1], price: _prod[2], list: _prod[3], psid: _prod[4], checked: false });
          });
        }
      });
      this.productsData = this.productsData.concat(res["data"]);
      this.totalRecords = res["totalRecords"];
      if (type != 'get') {
        this.selectedProductsData = [];
        this._systemService.snackBar(type);
        this.isAddProdLoader = false;
        this._changeDetectorRef.markForCheck();
      }
      this.isLoading = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData() {
    this.page++;
    this.isLoadMore = true;
    this.getCategoriesProducts(this.page, 'get');
  };
  //Update Category
  updateCategory() {
    if (this.ngName == '') {
      this._systemService.snackBar('Subcategory name is required');
      return;
    }
    let payload: UpdateSubCategory = {
      subCategory_name: this.ngName,
      subCategory_id: Number(this.paramsCatData.cat_id),
      category_id: Number(this.paramsCatData.sub_id),
      is_delete: false,
      update_subCategory: true
    }
    this.isUpdateCategoryLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._systemService.snackBar(res["message"]);
      this.isUpdateCategoryLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateCategoryLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  checkUncheckCoreProducts(item, check) {
    item.productsData.forEach(element => {
      element.checked = check;
    });
  }
  addNewProductsToList() {
    if (this.selectedProductsData.length == 0) {
      this._systemService.snackBar('Please select atleast 1 product');
      return;
    }
    let products = [];
    this.selectedProductsData.forEach(element => {
      products.push(Number(element.pk_productID));
    });

    this.isAddProdLoader = true;
    let payload: addSubCategoryProduct = {
      subCategoryID: Number(this.paramsCatData.sub_id),
      productIDs: products,
      add_subCategory_product: true
    };
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getCategoriesProducts(1, res["message"]);
      } else {
        this.isAddProdLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddProdLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  toggleDisplayOrder() {
    this.productsForDisplayOrder = [];
    this.isDisplayOrder = !this.isDisplayOrder;
    if (this.isDisplayOrder) {
      this.productsData.forEach(element => {
        element.productsData.forEach(prod => {
          this.productsForDisplayOrder.push(prod);
        });
      });
    }
  }

  updateDisplayOrder() {
    let Products = [];
    this.productsForDisplayOrder.forEach(element => {
      Products.push({
        list_order: Number(element.list),
        productID: element.id
      })
    });
    let payload: UpdateProductDisplayOrder = {
      subCategoryID: Number(this.paramsCatData.sub_id),
      products: Products,
      update_product_display_order: true
    }
    this.isUpdateDisplayLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._systemService.snackBar(res["message"]);
      this.isUpdateDisplayLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateDisplayLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
