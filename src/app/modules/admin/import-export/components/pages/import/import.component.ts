import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { ImportExportService } from '../../import-export.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as XLSX from 'xlsx';
import { importCategory, importProduct } from '../../import-export.types';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-import-order',
  templateUrl: './import.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class OrderImportComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  ngType = 1;
  file: any;
  categoriesData: any = [];
  productsData: any = [];
  isImportLoader: boolean = false;
  dataChecked: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    public _ImportExportService: ImportExportService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {

  };
  goBack() {
    this.router.navigateByUrl('import-export/home');
  }
  async onFileSelected(event: any) {
    this.dataChecked = false;
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      const data = XLSX.utils.sheet_to_json(ws);
      if (this.ngType == 2) {
        this.categoriesData = [];
        data.forEach((element: any) => {
          if (element.storeID || element.categoryID || element.subCategoryID) {
            let catName;
            let browserTitle;
            let categoryDescription;
            let categoryMetaDescription;
            let permalink;
            if (element.subCategoryID == 0) {
              catName = element.categoryName;
              browserTitle = element.categoryBrowserTitle;
              categoryDescription = element.categoryDescription;
              categoryMetaDescription = element.categoryMetaDescription;
              permalink = element.categoryName;
            } else {
              catName = element.subCategoryName;
              browserTitle = element.subCategoryBrowserTitle;
              categoryDescription = element.subCategoryDescription;
              categoryMetaDescription = element.subCategoryMetaDescription;
              permalink = element.subCategoryPermalink;
            }
            this.categoriesData.push({
              storeID: element.storeID,
              categoryID: element.categoryID,
              subCategoryID: element.subCategoryID,
              categoryName: catName,
              browserTitle: browserTitle,
              categoryDescription: categoryDescription,
              categoryMetaDescription: categoryMetaDescription,
              permalink: permalink
            });
          } else {
            this._ImportExportService.snackBar('One or more of the required colums appears to be missing a value in one or more rows. Please check the import file you provided to make sure none of these columns are blank for any rows.');
          }
        });
      } else if (this.ngType == 1) {
        this.productsData = [];
        data.forEach((element: any) => {
          if (element.storeID || element.productID || element.storeProductID) {
            this.productsData.push({
              productID: element.productID,
              storeProductID: element.storeProductID,
              productName: element.productName.replace(/'/g, "''"),
              productDescription: element.productDescription.replace(/'/g, "''"),
              productMiniDescription: element.productMiniDescription.replace(/'/g, "''"),
              metaDesc: element.productMetaDescription.replace(/'/g, "''"),
              keywords: element.keywords.replace(/'/g, "''"),
              storeProductPermalink: element.storeProductPermalink.replace(/'/g, "''"),
              storeProductDescription: element.storeProductDescription.replace(/'/g, "''"),
              storeProductMiniDescription: element.storeProductMiniDescription.replace(/'/g, "''"),
              storeProductMetaDescription: element.storeProductMetaDescription.replace(/'/g, "''"),
            });
          } else {
            this._ImportExportService.snackBar('One or more of the required colums appears to be missing a value in one or more rows. Please check the import file you provided to make sure none of these columns are blank for any rows.');
          }
        });
      }
    };
  }
  assignImportData() {
    if (this.ngType == 2) {
      if (this.categoriesData.length == 0) {
        this._ImportExportService.snackBar('There is no data to import');
        return;
      } else {
        this.dataChecked = true;
      }
    } else {
      if (this.productsData.length == 0) {
        this._ImportExportService.snackBar('There is no data to import');
        return;
      } else {
        this.dataChecked = true;
      }
    }
  }
  importData() {
    this.isImportLoader = true;
    if (this.ngType == 2) {
      let payload: importCategory = {
        categories: this.categoriesData,
        import_categories: true
      }
      this._ImportExportService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this._ImportExportService.snackBar(res["message"]);
        }
        this.isImportLoader = false;
        this.dataChecked = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isImportLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    } else {
      let payload: importProduct = {
        products: this.productsData,
        import_products: true
      }
      this._ImportExportService.PostAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this._ImportExportService.snackBar(res["message"]);
        }
        this.isImportLoader = false;
        this.dataChecked = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isImportLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }
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
