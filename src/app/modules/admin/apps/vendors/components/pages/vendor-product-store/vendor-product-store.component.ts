import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-vendor-product-store',
  templateUrl: './vendor-product-store.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorProductsStoreComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active', 'ordered', 'video'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';
  supplierData: any;
  isLoadMore: boolean = false;
  isLoadingExcel: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getVendorsData();
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getProductsData(1);
    })
  }
  getProductsData(page) {
    let params = {
      products_by_store: true,
      page: page,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = this.dataSource.concat(res["data"]);
      this.totalUsers = res["totalRecords"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData() {
    this.isLoadMore = true;
    this.page++;
    this.getProductsData(this.page);
  };
  downloadProductsExcelWorkSheet(): void {
    this.isLoadingExcel = true;
    let params = {
      products_by_store: true,
      size: this.totalUsers,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = this.dataSource.concat(res["data"]);
      this.isLoadingExcel = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingExcel = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    });



    // const size = this.productsCount;
    // this.exportLoaderToggle();
    // this._inventoryService.getProductsForExporting(size)
    //     .pipe(takeUntil(this._unsubscribeAll))
    //     .subscribe((products) => {
    //         this.exportLoaderToggle();
    //         const data = products["data"];
    //         const today = new Date();
    //         const month = today.getMonth() + 1; // This method returns count from 0 to 11. It means the value 0 refers to January and so on
    //         const date = today.getDate();
    //         const year = today.getFullYear();
    //         const hours = today.getHours();
    //         const minutes = today.getMinutes();
    //         const seconds = today.getSeconds();
    //         const fileName = `Products_${month}_${date}_${year}_${hours}_${minutes}_${seconds}`;
    //         const workbook = new Excel.Workbook();
    //         const worksheet = workbook.addWorksheet("My Sheet");

    //         worksheet.columns = [
    //             { header: "ID", key: "pk_productID", width: 10 },
    //             { header: "PRODUCTNUMBER", key: "productNumber", width: 20 },
    //             { header: "PRODUCTNAME", key: "productName", width: 32 },
    //             { header: "PRODUCTDESCRIPTION", key: "productDesc", width: 120 },
    //             { header: "MINIDESC", key: "miniDesc", width: 20 },
    //             { header: "KEYWORDS", key: "keywords", width: 32 },
    //             { header: "PERMALINK", key: "permalink", width: 10 },
    //             { header: "PRICINGLASTUPDATEDDATE", key: "pricingLastUpdatedDate", width: 32 }
    //         ];

    //         for (const obj of data) {
    //             worksheet.addRow(obj);
    //         }

    //         workbook.xlsx.writeBuffer().then((data: any) => {
    //             const blob = new Blob([data], {
    //                 type:
    //                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    //             });
    //             let url = window.URL.createObjectURL(blob);
    //             let a = document.createElement("a");
    //             document.body.appendChild(a);
    //             a.setAttribute("style", "display: none");
    //             a.href = url;
    //             a.download = `${fileName}.xlsx`;
    //             a.click();
    //             window.URL.revokeObjectURL(url);
    //             a.remove();
    //         });

    //         // Mark for check
    //         this._changeDetectorRef.markForCheck();
    //     })
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
