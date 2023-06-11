import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SystemService } from '../../../../system.service';
import { AddColor, AddCoreCategory, AddImprintColor, AddImprintMethod, AddNewCore, AddSubCategory, DeleteColor, DeleteImprintColor, UpdateColor, UpdateCoreCategory, UpdateImprintColor, UpdateImprintMethod, addSubCategoryProduct } from '../../../../system.types';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-categories-products',
  templateUrl: './categories-products.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CategoriesProductsComponent implements OnInit, OnDestroy {
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
  // Categories Dropdown
  allCategories = [];
  searchCategoriesCtrl = new FormControl();
  selectedCategories: any;
  isSearchingCategories = false;
  // Products Toggle
  isCatProdsEnable: boolean = false;

  ngName: string = '';
  isUpdateCategoryLoader: boolean = false;
  productsData = [];
  totalRecords = 0;



  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.ngName = this.paramsCatData.name;
    this.getCategoriesProducts(1)
  };
  getCategoriesProducts(page) {
    let params = {
      page: page,
      category_id: this.paramsCatData.cat_id,
      size: 10,
      core_categories_products: true
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.productsData = [];
        if (element.products) {
          let prods = element.products.split(',,');
          prods.forEach(prod => {
            let _prod = prod.split('::');
            element.productsData.push({ name: _prod[0], id: _prod[1], price: _prod[2], psid: _prod[3], checked: false });
          });
        }
      });
      this.productsData = this.productsData.concat(res["data"]);
      this.totalRecords = res["totalRecords"];
      this.isLoading = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadMore = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextData() {
    this.page++;
    this.isLoadMore = true;
    this.getCategoriesProducts(this.page);
  };
  //Update Category
  updateCategory() {
    if (this.ngName == '') {
      this._systemService.snackBar('Category name is required');
      return;
    }
    let payload: UpdateCoreCategory = {
      category_name: this.ngName,
      core_id: Number(this.paramsCatData.coreID),
      category_id: Number(this.paramsCatData.cat_id),
      is_delete: false,
      update_core_category: true
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





  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
