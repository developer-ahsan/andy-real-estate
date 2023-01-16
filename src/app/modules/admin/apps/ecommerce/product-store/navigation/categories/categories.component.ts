import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { AddSubCategory, update_subcategories } from '../../store.types';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styles: ['.form-control:focus {border-color: #475569;box-shadow: 0 0 0 0;}']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  extrinsicCat: string = '';
  isUpdateLoading: boolean = false;

  allCategories = [];
  totalCategories = 0;
  categorypage = 1;
  isCategoryLoader: boolean = false;

  selectedCategories = [];
  removedCategories = [];

  isUpdateCategories: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCategories(1);
  }
  getCategories(page) {
    let params = {
      store_product_categories: true,
      page: page,
      product_id: this.selectedProduct.pk_storeProductID,
      store_id: this.selectedProduct.fk_storeID,
      size: 20
    }
    this._storeService.commonGetCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (element.Child) {
          element.Child = JSON.parse(element.Child);
          element.Child.forEach(item => {
            if (item.isChecked) {
              this.selectedCategories.push({ subcategory_id: item.pk_subCategoryID, isChecked: true });
            }
          });
        } else {
          element.Child = [];
        }
        this.allCategories.push(element);
      });
      this.totalCategories = res["totalRecords"];
      this.isCategoryLoader = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCategoryLoader = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextCategoryData() {
    this.isCategoryLoader = true;
    this.categorypage++;
    this.getCategories(this.categorypage);
  };
  changeCheckbox(item, checked) {
    if (checked) {
      const index = this.selectedCategories.findIndex(val => val.subcategory_id == item.pk_subCategoryID);
      if (index < 0) {
        this.selectedCategories.push({ subcategory_id: item.pk_subCategoryID, isChecked: true });
      } else {
        this.selectedCategories[index].isChecked = true;
      }
    } else {
      const index = this.selectedCategories.findIndex(val => val.subcategory_id == item.pk_subCategoryID);
      if (index > -1) {
        this.selectedCategories[index].isChecked = false;
      } else {
        this.selectedCategories.push({ subcategory_id: item.pk_subCategoryID, isChecked: false });
      }
    }
  }

  addNewCategory(item) {
    let payload: AddSubCategory = {
      category_id: item.pk_categoryID,
      subCategory_name: item.newChild,
      perma_link: this.convertToSlug(item.newChild),
      add_subcategory: true
    }
    item.addLoader = true;
    this._storeService.postStoresProductsData(payload).subscribe(res => {
      if (res["success"]) {
        item.Child.push({ subCategoryName: payload.subCategory_name, pk_subCategoryID: res["newID"], isChecked: 0 });
      }
      item.addLoader = false;
      item.newChild = '';
      this._storeService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.addLoader = false;
      this._storeService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    })
  }
  convertToSlug(Text) {
    return Text.toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  updateCategories() {
    let payload: update_subcategories = {
      store_product_id: this.selectedProduct.pk_storeProductID,
      subcategories: this.selectedCategories,
      update_subcategories: true
    }
    this.isUpdateCategories = true;
    this._storeService.putStoresProductData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.isUpdateCategories = false;
        this._storeService.snackBar(res["message"]);
        this._changeDetectorRef.markForCheck();
      } else {
        this._storeService.snackBar(res["message"]);
        this.isUpdateCategories = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this._storeService.snackBar('Something went wrong');
      this.isUpdateCategories = false;
      this._changeDetectorRef.markForCheck();
    });
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
