import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddImprintColor, AddImprintMethod, AddNewCore, DeleteColor, DeleteCore, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../system.types';

@Component({
  selector: 'app-core-products',
  templateUrl: './core-products.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CoreProductsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'cat', 'sub_cat', 'prod', 'unique', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Core Product Lists';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add New Core
  ngName: string = '';
  ngCoreCheck: boolean = false;
  ngCoreSelect: number = 0;
  coreListCategories = [];
  isCoreListCategoriesLoader: boolean = false;
  categoryListPage = 1;
  isMoreLoader: boolean = false;
  totalCategories = 0;

  ngDesc: string = '';
  isAddCoreLoader: boolean = false;

  // Update Color
  isUpdateMethodLoader: boolean = false;
  isUpdateMethod: boolean = false;
  updateMethodData: any;
  ngRGBUpdate = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCoreList(1, 'get');
  };
  calledScreen(value) {
    this.mainScreen = value;
  }
  getCoreList(page, type) {
    let params = {
      all_cores: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddCoreLoader = false;
        this.ngName = '';
        this.coreListCategories = [];
        this.ngCoreSelect = 0;
        this.ngCoreCheck = false;
        this._systemService.snackBar('New Core Added Successfully');
        this.mainScreen = 'Current Core Product Lists';
      }
      this.isLoading = false;
      this.isSearching = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getCoreList(this.page, 'get');
  };
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getCoreList(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  // Get Categories List 
  onChangeSelectionCore(value) {
    this.coreListCategories = [];
    if (value != 0) {
      this.isCoreListCategoriesLoader = true;
      this.getCoreListCategories(1);
    }
  }
  getCoreListCategories(page) {
    let params = {
      page: page,
      core_id: this.ngCoreSelect,
      core_categories_subcategories: true
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.checked = true;
        element.subCats = [];
        if (element.subCategories) {
          let splitCats = element.subCategories.split(',');
          splitCats.forEach(cats => {
            let sub_cats = cats.split(':');
            element.subCats.push({ id: sub_cats[0], name: sub_cats[1], checked: true });
          });
        }
      });
      this.coreListCategories = this.coreListCategories.concat(res["data"]);
      this.totalCategories = res["totalRecords"];
      this.isCoreListCategoriesLoader = false;
      this.isMoreLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isMoreLoader = false;
      this.isCoreListCategoriesLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextCoreCategories() {
    this.categoryListPage++;
    this.isMoreLoader = true;
    this.getCoreListCategories(this.categoryListPage);
  }

  checkUncheckCoreCats(item, check, type, index) {
    if (type == 'main') {
      item.checked = check;
      item.subCats.forEach(element => {
        element.checked = check;
      });
    } else {
      item.subCats[index].checked = check;
    }
  }

  addNewCoreList() {
    if (this.ngName == '') {
      this._systemService.snackBar('Core list name is required');
      return;
    }
    let categories = [];
    if (this.ngCoreCheck) {
      this.coreListCategories.forEach(element => {
        if (element.checked) {
          let subCategory_names = [];
          element.subCats.forEach(sub => {
            if (sub.checked) {
              subCategory_names.push(sub.name.replace(/'/g, '"'));
            }
          });
          categories.push({ category_name: element.categoryName, subCategory_names: subCategory_names });
        }
      });
    }
    let payload: AddNewCore = {
      core_name: this.ngName,
      blnCopy: this.ngCoreCheck,
      categories: categories,
      add_core: true
    }
    this.isAddCoreLoader = true;
    this._systemService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getCoreList(1, 'add')
      } else {
        this.isAddCoreLoader = false;
        this._systemService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddCoreLoader = false;
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Delete Color
  deleteColor(item) {
    item.delLoader = true;
    let payload: DeleteImprintColor = {
      imprint_color_id: item.pk_imprintColorID,
      delete_imprint_color: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(color => color.pk_imprintColorID != item.pk_imprintColorID);
      this.totalUsers--;
      this._systemService.snackBar('Color Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    });
  }
  // Update Method
  updateMethodToggle(item) {
    console.log(item)
    this.updateMethodData = item;
    this.isUpdateMethod = !this.isUpdateMethod;
  }
  updateMethod() {
    if (this.updateMethodData.imprintColorName == '') {
      this._systemService.snackBar('Color name is required');
      return;
    }
    const rgb = this.ngRGBUpdate.replace('#', '');
    let payload: UpdateImprintMethod = {
      method_id: this.updateMethodData.pk_methodID,
      method_name: this.updateMethodData.methodName,
      description: this.updateMethodData.methodDescription,
      update_imprint_method: true
    }
    this.isUpdateMethodLoader = true;
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateMethodLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(elem => {
        if (elem.pk_methodID == this.updateMethodData.pk_methodID) {
          elem.methodName = this.updateMethodData.methodName;
          elem.methodDescription = this.updateMethodData.methodDescription;
        }
      });
      this._systemService.snackBar('Method Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
    })
  }
  // Remove CoreList
  removeCoreList(item) {
    item.delLoader = false;
    let payload: DeleteCore = {
      coreID: Number(item.pk_coreID),
      delete_core: true
    }
    this._systemService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.totalUsers--;
        this.dataSource = this.dataSource.filter(data => data.pk_coreID != item.pk_coreID);
        this.tempRecords--;
        this.tempDataSource = this.tempDataSource.filter(data => data.pk_coreID != item.pk_coreID);
        this._systemService.snackBar(res["message"]);
        item.delLoader = false;
        this._changeDetectorRef.markForCheck();
      } else {
        item.delLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.delLoader = false;
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
