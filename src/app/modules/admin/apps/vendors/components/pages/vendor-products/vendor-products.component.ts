import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';

@Component({
  selector: 'app-vendor-products',
  templateUrl: './vendor-products.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorProductsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active', 'ordered', 'video'];
  totalUsers = 0;
  tempTotalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;
  blnActive = 3;
  keyword = '';
  blnVideo = 3;

  isSearchingLoader: boolean = false;

  isFileDownloadLoader: boolean = false;
  fileDownloadLoader: boolean = false;
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
      this.getProducts(1);
    })
  }
  getProducts(page) {
    let blnActive = this.blnActive;
    let blnVideo = this.blnVideo;
    if (this.blnActive == 3) {
      blnActive = null;
    }
    if (this.blnVideo == 3) {
      blnVideo = null;
    }
    let params = {
      products: true,
      page: page,
      bln_active: blnActive,
      keyword: this.keyword,
      bln_video: blnVideo,
      size: 20,
      supplier_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempTotalUsers = res["totalRecords"];
      }
      if (this.isSearchingLoader) {
        this.isSearchingLoader = false;
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearchingLoader = false;
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
    this.getProducts(this.page);
  };
  searchProduct() {
    this.page = 1;
    this.isSearchingLoader = true;
    this.paginator.firstPage();
    this.getProducts(1);
  }
  resetFilter() {
    if (this.page > 1) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempTotalUsers;
    this.blnActive = 3;
    this.blnVideo = 3;
    this.keyword = '';
    this._changeDetectorRef.markForCheck();
  }

  // Download Excel File
  downloadExcelWorkSheet() {
    let blnActive = this.blnActive;
    let blnVideo = this.blnVideo;
    if (this.blnActive == 3) {
      blnActive = null;
    }
    if (this.blnVideo == 3) {
      blnVideo = null;
    }
    let params = {
      products: true,
      bln_active: blnActive,
      keyword: this.keyword,
      bln_video: blnVideo,
      size: this.totalUsers,
      supplier_id: this.supplierData.pk_companyID
    }
    this.isFileDownloadLoader = true;
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const fileName = `Vendor-Products-${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Products");
      // Columns
      worksheet.columns = [
        { header: "Product ID", key: "CoreCount", width: 10 },
        { header: "Product Name", key: "productName", width: 30 },
        { header: "Product Number", key: "productNumber", width: 30 },
        { header: "Active", key: "blnActive", width: 30 },
        { header: "Last Updated By", key: "lastUpdatedBy", width: 30 },
        { header: "Last Updated Date", key: "lastUpdatedDate", width: 30 },
        { header: "Pricing Last Updated By", key: "pricingLastUpdatedBy", width: 30 },
        { header: "Pricing Last Updated Date", key: "pricingLastUpdatedDate", width: 30 },
        { header: "Product Video ID", key: "productVideoID", width: 10 }
      ];
      for (const obj of res["data"]) {
        obj.lastUpdatedDate = moment(obj.lastUpdatedDate).format('MM-DD-yy-hh-mm-ss');
        obj.pricingLastUpdatedDate = moment(obj.pricingLastUpdatedDate).format('MM-DD-yy-hh-mm-ss');
        worksheet.addRow(obj);
      }
      this.isFileDownloadLoader = false;
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
      });

      // Mark for check
      this._changeDetectorRef.markForCheck();

    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isFileDownloadLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  downloadExcelWorkSheetReport() {
    let params = {
      products: true,
      size: this.totalUsers,
      supplier_id: this.supplierData.pk_companyID
    }
    this.fileDownloadLoader = true;
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const fileName = `${this.supplierData.pk_companyID}_Products`;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Products");
      // Columns
      worksheet.columns = [
        { header: "Active", key: "blnActive", width: 10 },
        { header: "Ordered", key: "OrdersCount", width: 10 },
        { header: "PID", key: "pk_productID", width: 10 },
        { header: "Product Name", key: "productName", width: 30 },
        { header: "Product Number", key: "productNumber", width: 30 }

      ];
      for (const obj of res["data"]) {
        if (obj.blnActive) {
          obj.blnActive = 1;
        } else {
          obj.blnActive = 0;
        }
        if (obj.OrdersCount) {
          obj.OrdersCount = 1;
        } else {
          obj.OrdersCount = 0;
        }
        worksheet.addRow(obj);
      }
      this.fileDownloadLoader = false;
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
      });

      // Mark for check
      this._changeDetectorRef.markForCheck();

    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.fileDownloadLoader = false;
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
