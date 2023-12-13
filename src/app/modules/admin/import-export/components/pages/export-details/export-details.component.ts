import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ImportExportService } from '../../import-export.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';

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
  isExportLoader: boolean;
  cateGoryExcelData1: any;
  productsExcelData: any;
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
      store_id: this.paramsData.storeID
    }
    this._exportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.checked = true;
        element.subCats = (element.subCategories || '').split(',,').map(sub => {
          const [pk_subCategoryID, subCategoryName] = sub.split('::');
          return { pk_subCategoryID: Number(pk_subCategoryID), subCategoryName, isChecked: true, pk_categoryID: element.pk_categoryID };
        });
        this.allCategories.push(element);
      });

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
  getCategoriesExportData() {
    // this.isExportLoader = true;
    let catList = [];
    let excludeSubCatID = [];

    this.allCategories.forEach(element => {
      if (element.checked) {
        catList.push(element.pk_categoryID);
        element.subCats.forEach(subCat => {
          if (!subCat.isChecked) {
            excludeSubCatID.push(subCat.pk_subCategoryID);
          }
        });
      }
    });
    let params = {
      export_categories: true,
      categories_id_list: catList.toString(),
      exclude_list: excludeSubCatID.toString(),
      store_id: this.paramsData.storeID
    }
    this._exportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.cateGoryExcelData1 = res["data"];
      this.isExportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isExportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getExportProductsData() {
    this.isExportLoader = true;
    let catSubList = [];
    this.allCategories.forEach(element => {
      element.subCats.forEach(item => {
        if (item.isChecked) {
          catSubList.push(item.pk_subCategoryID);
        }
      });
    });
    let params = {
      export_products: true,
      categories_id_list: catSubList.toString()
    }
    this._exportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.productsExcelData = res["data"];
      this.isExportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isExportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  changeCheckbox(item, checked) {
    if (checked) {
      const index = this.selectedCategories.findIndex(val => val.subcategory_id == item.pk_subCategoryID);
      if (index < 0) {
        this.selectedCategories.push({ subcategory_id: item.pk_subCategoryID, isChecked: true });
      } else {
        this.selectedCategories[index].isChecked = true;
      }
      this.allCategories.filter(cat => {
        if (cat.pk_categoryID == item.pk_categoryID) {
          cat.checked = true;
        }
      })
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
  downloadCatExcelWorkSheet() {
    let data = [];
    this.cateGoryExcelData1.forEach(element => {
      element.subCategoryID = 0;
      element.subCategoryName = '';
      element.subCategoryPermalink = '';
      data.push(
        {
          fk_storeID: element.fk_storeID,
          pk_categoryID: element.pk_categoryID,
          subCategoryID: 0,
          categoryName: element.categoryName,
          subCategoryName: '',
          categoryPermalink: element.permalink,
          subCategoryPermalink: '',
          categoryDescription: element.categoryDesc,
          subCategoryDescription: '',
          categoryMetaDescription: element.metaDesc,
          subCategoryMetaDescription: '',
          categoryBrowserTitle: element.browserTitle,
          subCategoryBrowserTitle: ''
        });
      if (element.subCategories) {
        let subCat = element.subCategories.split(',,');
        subCat.forEach(sub => {
          const [pk_subCategoryID, subCategoryName, permalink, subCategoryDesc, metaDesc, browserTitle] = sub.split('::');
          data.push(
            {
              fk_storeID: element.fk_storeID,
              pk_categoryID: element.pk_categoryID,
              subCategoryID: pk_subCategoryID,
              categoryName: element.categoryName,
              subCategoryName: subCategoryName,
              categoryPermalink: '',
              subCategoryPermalink: permalink,
              categoryDescription: '',
              subCategoryDescription: subCategoryDesc != 'N/A' ? subCategoryDesc : '',
              categoryMetaDescription: '',
              subCategoryMetaDescription: metaDesc != 'N/A' ? metaDesc : '',
              categoryBrowserTitle: '',
              subCategoryBrowserTitle: browserTitle != 'N/A' ? browserTitle : ''
            });
        });
      }
    });
    // console.log(data);
    // return;
    const fileName = `Categories_Export-${this.paramsData.storeName}-${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Categories_Export");

    // Columns
    worksheet.columns = [
      { header: "storeID", key: "fk_storeID", width: 10 },
      { header: "categoryID", key: "pk_categoryID", width: 10 },
      { header: "subCategoryID", key: "subCategoryID", width: 10 },
      { header: "categoryName", key: "categoryName", width: 20 },
      { header: "subCategoryName", key: "subCategoryName", width: 20 },
      { header: "categoryPermalink", key: "permalink", width: 20 },
      { header: "subCategoryPermalink", key: "subCategoryPermalink", width: 20 },
      { header: "categoryDescription", key: "categoryDescription", width: 40 },
      { header: "subCategoryDescription", key: "subCategoryDescription", width: 40 },
      { header: "categoryMetaDescription", key: "categoryMetaDescription", width: 40 },
      { header: "subCategoryMetaDescription", key: "subCategoryMetaDescription", width: 40 },
      { header: "categoryBrowserTitle", key: "categoryBrowserTitle", width: 20 },
      { header: "subCategoryBrowserTitle", key: "subCategoryBrowserTitle", width: 20 }
    ];
    for (const obj of data) {
      worksheet.addRow(obj);
    }
    setTimeout(() => {
      workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("style", "display: none");
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this._changeDetectorRef.markForCheck();
      });
    }, 500);

  }
  downloadProductsExcelWorkSheet() {
    let data = this.productsExcelData;
    const fileName = `Product_Export-${this.paramsData.storeName}-${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Product_Export");

    // Columns
    worksheet.columns = [
      { header: "storeID", key: "storeID", width: 10 },
      { header: "productID", key: "pk_productID", width: 10 },
      { header: "storeProductID", key: "storeProductID", width: 20 },
      { header: "productName", key: "productName", width: 70 },
      { header: "productDescription", key: "productDescription", width: 100 },
      { header: "productMiniDescription", key: "productMiniDescription", width: 100 },
      { header: "productMetaDescription", key: "storeProductMetaDescription", width: 50 },
      { header: "keywords", key: "keywords", width: 50 },
      { header: "storeProductPermalink", key: "storeProductPermalink", width: 50 },
      { header: "storeProductDescription", key: "storeProductDescription", width: 50 },
      { header: "storeProductMiniDescription", key: "storeProductMiniDescription", width: 50 },
      { header: "storeProductMetaDescription", key: "storeProductMetaDescription", width: 50 },
    ];
    for (const obj of data) {
      worksheet.addRow(obj);
    }
    setTimeout(() => {
      workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("style", "display: none");
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this._changeDetectorRef.markForCheck();
      });
    }, 500);

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
