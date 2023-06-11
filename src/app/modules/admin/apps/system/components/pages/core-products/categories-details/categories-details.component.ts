import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SystemService } from '../../../system.service';
import { AddColor, AddCoreCategory, AddImprintColor, AddImprintMethod, AddNewCore, AddSubCategory, DeleteColor, DeleteImprintColor, UpdateColor, UpdateCoreCategory, UpdateImprintColor, UpdateImprintMethod, UpdateSubCategory } from '../../../system.types';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-categories-details-products',
  templateUrl: './categories-details.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CategoriesDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['category', 'subcat', 'products', 'action'];
  page = 1;

  mainScreen: string = 'Current Categories Lists';
  keyword = '';
  not_available = 'N/A';

  ngName: string = '';
  ngSubcatName: string = '';
  isAddCatLoader: boolean = false;
  isAddSubCatLoader: boolean = false;


  isSearching: boolean = false;
  totalCategories = 0;

  coreID: any;
  // Categories Dropdown
  allCategories = [];
  searchCategoriesCtrl = new FormControl();
  selectedCategories: any;
  isSearchingCategories = false;
  // Products Toggle
  isCatProdsEnable: boolean = false;
  paramsCatData: any;
  isSubCatProdsEnable: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._activeRoute.params.subscribe(params => {
      this.isLoading = true;
      this.coreID = params.id;
      this.getCoreListCategories(1, 'get')
    });
    this.initialize();
  };
  initialize() {
    let params;
    this.searchCategoriesCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          core_id: this.coreID,
          core_categories_subcategories: true,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allCategories = [];
        this.isSearchingCategories = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._systemService.getSystemsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingCategories = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allCategories = data['data'];
    });
  }
  calledScreen(value) {
    this.mainScreen = value;
  }

  getCoreListCategories(page, type) {
    let params = {
      page: page,
      core_id: this.coreID,
      size: 20,
      core_categories_subcategories: true
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.subCats = [];
        if (element.subCategories) {
          let splitCats = element.subCategories.split(',');
          splitCats.forEach(cats => {
            let sub_cats = cats.split(':');
            element.subCats.push({ id: sub_cats[0], name: sub_cats[1], product: sub_cats[2] });
          });
        }
      });
      this.dataSource = res["data"];
      this.allCategories = res["data"];
      this.totalCategories = res["totalRecords"];
      if (type != 'get') {
        this.ngName = '';
        this.ngSubcatName = '';
        this.isAddCatLoader = false;
        this.isAddSubCatLoader = false;
        this._systemService.snackBar(type);
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  onSelected(ev) {
    this.selectedCategories = ev.option.value;
  }
  displayWith(value: any) {
    return value?.categoryName;
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getCoreListCategories(this.page, 'get');
  };
  // Add New Category
  addNewCategory() {
    if (this.ngName == '') {
      this._systemService.snackBar('Category name is required');
      return;
    }
    let payload: AddCoreCategory = {
      core_id: this.coreID,
      category_name: this.ngName,
      add_core_category: true
    }
    this.isAddCatLoader = true;
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getCoreListCategories(1, res["message"]);
      } else {
        this._systemService.snackBar(res["message"]);
        this.isAddCatLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddCatLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  addNewSubCategory() {
    if (this.ngSubcatName == '') {
      this._systemService.snackBar('Category name is required');
      return;
    }
    if (!this.selectedCategories) {
      this._systemService.snackBar('Please select any category');
      return;
    }
    let payload: AddSubCategory = {
      categoryID: this.selectedCategories.pk_categoryID,
      subCategoryName: this.ngSubcatName,
      add_subCategory: true
    }
    this.isAddSubCatLoader = true;
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getCoreListCategories(1, res["message"]);
      } else {
        this._systemService.snackBar(res["message"]);
        this.isAddSubCatLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddSubCatLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }

  // Go To Products
  goToCatProducts(item) {
    this.paramsCatData = { coreID: this.coreID, cat_id: item.pk_categoryID, name: item.categoryName };
    this.isCatProdsEnable = true;
    this._changeDetectorRef.markForCheck();
  }
  goToSubCatProducts(id, sub_Cat) {
    this.paramsCatData = { coreID: this.coreID, cat_id: id, name: sub_Cat.name, sub_id: sub_Cat.id };
    this.isSubCatProdsEnable = true;
    this._changeDetectorRef.markForCheck();
  }
  backToCategories() {
    this.paramsCatData = null;
    this.isSubCatProdsEnable = false;
    this.isCatProdsEnable = false;
    this._changeDetectorRef.markForCheck();
  }
  removeSubCategory(cat, sub_cat) {
    sub_cat.delLoader = true;
    let payload: UpdateSubCategory = {
      subCategory_name: sub_cat.name,
      subCategory_id: Number(cat.pk_categoryID),
      category_id: Number(sub_cat.id),
      is_delete: true,
      update_subCategory: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        let index = cat.subCats.findIndex(item => item.id == sub_cat.id);
        cat.subCats.splice(index, 1);
        this._systemService.snackBar(res["message"]);
        sub_cat.delLoader = false;
        this._changeDetectorRef.markForCheck();
      } else {
        sub_cat.delLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      sub_cat.delLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removeCategory(cat) {
    cat.delLoader = true;
    let payload: UpdateCoreCategory = {
      category_name: cat.categoryName,
      core_id: Number(this.coreID),
      category_id: Number(cat.pk_categoryID),
      is_delete: true,
      update_core_category: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.dataSource = this.dataSource.filter(item => item.pk_categoryID != cat.pk_categoryID);
        this.allCategories = this.allCategories.filter(item => item.pk_categoryID != cat.pk_categoryID);
        this.totalCategories--;
        this._systemService.snackBar(res["message"]);
        cat.delLoader = false;
        this._changeDetectorRef.markForCheck();
      } else {
        cat.delLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      cat.delLoader = false;
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
