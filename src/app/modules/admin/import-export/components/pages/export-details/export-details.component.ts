import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ImportExportService } from '../../import-export.service';

@Component({
  selector: 'app-export-details',
  templateUrl: './export-details.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ExportDetailComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isLoading: boolean;

  paramsData: any;
  // Stores
  allCategories = [];
  totalCategories = 0;
  categorypage = 1;
  isCategoryLoader: boolean = false;

  selectedCategories = [];
  removedCategories = [];

  ngSelectAll: boolean = true;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _exportService: ImportExportService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this._activeRoute.queryParams.subscribe(res => {
      this.paramsData = res;
      this.isLoading = true;
      this.getCategories(1);
    });
  };
  getCategories(page) {
    let params = {
      store_categories: true,
      page: page,
      store_id: this.paramsData.storeID,
      size: 20
    }
    this._exportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.checked = true;
        element.subCats = [];
        if (element.subCategories) {
          let subCat = element.subCategories.split(',');
          subCat.forEach(sub => {
            let sub_cat = sub.split(':');
            element.subCats.push({ pk_subCategoryID: Number(sub_cat[0]), subCategoryName: sub_cat[1], isChecked: true, pk_categoryID: element.pk_categoryID });
          });
        }
        this.allCategories.push(element);
      });
      this.totalCategories = res["totalRecords"];
      this.isCategoryLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCategoryLoader = false;
      this.isLoading = false;
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
  changeMainCheckbox(item, checked) {
    item.subCats.forEach(element => {
      element.isChecked = checked;
    });
  }
  unSelectAll(checked) {
    this.allCategories.forEach(element => {
      element.checked = checked;
      element.subCats.forEach(item => {
        item.isChecked = checked;
      });
    });
  }
  goBack() {
    this.router.navigateByUrl('import-export/export');
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
