import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { retry, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import moment from 'moment';
import * as Excel from 'exceljs/dist/exceljs.min.js';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html',
})

export class StoreProductsComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'name', 'vendor', 'master', 'store', 'desc', 'video', 'techno_logo'];
  dataSource = [];
  totalRecords = 0;
  totalProducts = 0;
  itemsPerPage = 50;

  totalRecordsExcel: any;

  generateReportLoader: boolean = false;

  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;
  isKeywordSearch: boolean = false;
  keywordSearch: string = "";

  isFilterLoader: boolean = false;
  isToggleFilter: boolean = false;

  storeCategories = [];

  keyword = '';
  category = 0;
  status = 1;
  hasDescription = 0;
  hasOrdered = 0;
  vendorRelation = 0;
  hasVideo = 0;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.isLoading = true;
        this.getStoreCategories();
        this.getProductsByCategories(this.page);
      });
  }
  getProductsByCategories(page) {
    if (page == 1) {
      this.page = 1;
      this.isFilterLoader = true;
    }
    let params = {
      store_products_per_store: true,
      store_id: this.selectedStore.pk_storeID,
      keyword: this.keyword,
      status: this.status,
      category_id: this.category,
      has_description: this.hasDescription,
      has_ordered: this.hasOrdered,
      vendor_relation: this.vendorRelation,
      has_video: this.hasVideo,
      // size: 5,
      page: page
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.totalRecordsExcel = res['totalRecords'];
      let data = [];
      res["data"].forEach(element => {
        if (element.categoryName) {
          let index = data.findIndex(cat => cat.categoryName == element.categoryName);
          if (index < 0) {
            data.push({ categoryName: element.categoryName, products: [element] });
          } else {
            data[index].products.push(element);
          }
        } else {
          let index = data.findIndex(cat => cat.categoryName == 'UNCATEGORIZED');
          if (index < 0) {
            data.push({ categoryName: 'UNCATEGORIZED', products: [element] });
          } else {
            data[index].products.push(element);
          }
        }
        // element.products = [];
        // if (element.productsList) {
        //   let cat_List = element.productsList.split(',,');
        //   cat_List.forEach(product => {
        //     let data = product.split('==');
        //     element.products.push({
        //       spid: data[0],
        //       name: data[1],
        //       vendor: data[2],
        //       relation: data[3],
        //       date: data[4],
        //       master: data[5],
        //       store: data[6],
        //       desc: data[7],
        //       image: data[8],
        //       video: data[9],
        //       colors: data[10],
        //       logo: data[11],
        //       o: data[12],
        //     })
        //   });
        // }
      });
      this.dataSource = data;
      // this.totalRecords = res["categoryCount"];
      this.totalRecords = res["totalRecords"];
      this.totalProducts = res["totalRecords"];
      this.isLoading = false;
      this.isFilterLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFilterLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextPrductData(event) {
    this.page = event;
    this.isLoading = true;
    this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    this.getProductsByCategories(this.page);
  };
  getStoreCategories() {
    let params = {
      category: true,
      store_id: this.selectedStore.pk_storeID,
      size: 100
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeCategories = res["data"];
    });
  }
  // getNextData() {
  //   this.page++;
  //   this.isLoadMore = true;
  //   this.getProducts(this.page);
  // };
  toggleFilter() {
    this.isToggleFilter = !this.isToggleFilter;
  }
  getFirstCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the store products
    this._storeManagerService.getStoreProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll), retry(3))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        // this.getMainStoreCall(1);
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the store products
    this._storeManagerService.getStoreProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        this.getMainStoreCall(1);
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;
    this.keywordSearch = "";

    // Mark for check
    this._changeDetectorRef.markForCheck();
  };

  searchStoreProduct(event): void {
    const { pk_storeID } = this.selectedStore;

    let keyword = event.target.value ? event.target.value : '';
    this.keywordSearch = keyword;

    if (this.keywordSearch) {
      this.isKeywordSearch = true;
      this._storeManagerService.getStoreProductsByKeywords(pk_storeID, keyword)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          this.dataSource = response["data"];
          this.dataSourceTotalRecord = response["totalRecords"];
          this.isKeywordSearch = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.isKeywordSearch = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    }
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getMainStoreCall(this.page);
  };
  goToStoreProduct(item) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/apps/ecommerce/inventory/storeProduct', item.pk_storeProductID]));
    window.open(url, '_blank');
  }

  generateDataSheet() {

    let params = {
      store_products_per_store: true,
      store_id: this.selectedStore.pk_storeID,
      keyword: this.keyword,
      status: this.status,
      category_id: this.category,
      has_description: this.hasDescription,
      has_ordered: this.hasOrdered,
      vendor_relation: this.vendorRelation,
      has_video: this.hasVideo,
      size: this.totalRecordsExcel
    }
    this.generateReportLoader = true;

    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const data = res['data'];

      const fileName = `${this.selectedStore.storeName}-${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("storeProducts");

      // Columns
      worksheet.columns = [
        { header: "pk_storeProductID", key: "pk_storeProductID", width: 30 },
        { header: "blnStoreActive", key: "blnStoreActive", width: 30 },
        { header: "storeProductPermalink", key: "storeProductPermalink", width: 30 },
        { header: "productNumber", key: "productNumber", width: 30 },
        { header: "blnActive", key: "blnActive", width: 30 },
        { header: "permalink", key: "permalink", width: 10 },
        { header: "lastUpdatedDate", key: "lastUpdatedDate", width: 30 },
        { header: "pk_productID", key: "pk_productID", width: 30 },
        { header: "technoLogoSKU", key: "technoLogoSKU", width: 30 },
        { header: "fk_supplierID", key: "fk_supplierID", width: 30 },
        { header: "firstColumnPricing", key: "firstColumnPricing", width: 30 },
        { header: "msrp", key: "msrp", width: 10 },
        { header: "percentSavings", key: "percentSavings", width: 30 },
        { header: "categoryName", key: "categoryName", width: 30 },
        { header: "pk_categoryID", key: "pk_categoryID", width: 30 },
        { header: "specialDescription", key: "specialDescription", width: 30 },
        { header: "vendorRelation", key: "vendorRelation", width: 30 },
        { header: "companyName", key: "companyName", width: 30 },
        { header: "productVideo", key: "productVideo", width: 30 },
        { header: "storeProductVideo", key: "storeProductVideo", width: 30 },
        { header: "productCost", key: "productCost", width: 30 },
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
          this.generateReportLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      }, 500);
      this.generateReportLoader = false;
    })




  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
