import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { AddSubCategory, update_subcategories } from '../../store.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styles: ['.form-control:focus {border-color: #475569;box-shadow: 0 0 0 0;}']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
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
    private _storeService: StoreProductService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getCategories(1);
    });
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
        element.subCategories = [];
        if (element.Child) {
          let subCat = element.Child.split(',');
          subCat.forEach(sub => {
            let sub_cat = sub.split(':');
            if (sub_cat[2] == 1) {
              sub_cat[2] = true;
              this.selectedCategories.push({ subcategory_id: Number(sub_cat[0]), isChecked: true });
            } else {
              sub_cat[2] = false;
            }
            element.subCategories.push({ pk_subCategoryID: Number(sub_cat[0]), subCategoryName: sub_cat[1], isChecked: sub_cat[2], pk_categoryID: element.pk_categoryID });
          });
        }
        this.allCategories.push(element);
      });
      // res["data"].forEach(element => {
      //   if (element.Child) {
      //     element.Child = JSON.parse(element.Child);
      //     element.Child.forEach(item => {
      //       if (item.isChecked) {
      //         this.selectedCategories.push({ subcategory_id: item.pk_subCategoryID, isChecked: true });
      //       }
      //     });
      //   } else {
      //     element.Child = [];
      //   }
      //   this.allCategories.push(element);
      // });
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
    if (!item.newChild) {
      this._storeService.snackBar('Subcategory name is required');
      return;
    }
    let payload: AddSubCategory = {
      category_id: item.pk_categoryID,
      subCategory_name: item.newChild,
      perma_link: this.convertToSlug(item.newChild),
      add_subcategory: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    if (!payload.subCategory_name) {
      this._storeService.snackBar('Subcategory name is required');
      return;
    }
    item.addLoader = true;
    this._storeService.postStoresProductsData(payload).subscribe(res => {
      if (res["success"]) {
        item.subCategories.push({ subCategoryName: payload.subCategory_name, pk_subCategoryID: res["newID"], isChecked: 0 });
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
    if (this.selectedCategories.length == 0) {
      this._storeService.snackBar("Select at least one subcategory");
      return;
    }
    let payload: update_subcategories = {
      store_product_id: this.selectedProduct.pk_storeProductID,
      subcategories: this.selectedCategories,
      update_subcategories: true
    }
    this.isUpdateCategories = true;
    this._storeService.putStoresProductData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeService.getStoreProductsDetail(this.selectedProduct.pk_storeProductID).subscribe(response => {
          this.isUpdateCategories = false;
          this._storeService.snackBar(res["message"]);
          this._changeDetectorRef.markForCheck();
        });
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
