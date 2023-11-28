import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-top-order-products',
  templateUrl: './top-order-products.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorTopOrderComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'times', 'core'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;
  fileDownloadLoader: boolean;

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
      this.getTopOrderProducts(1);
    })
  }
  getTopOrderProducts(page) {
    let params = {
      top_products: true,
      page: page,
      size: 20,
      supplier_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
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
    this.getTopOrderProducts(this.page);
  };

  // Download Excel File
  downloadExcelWorkSheet() {
    let payload = {
      top_products: true,
      size: this.totalUsers,
      supplier_id: this.supplierData.pk_companyID
    };
    this.fileDownloadLoader = true;
    this._vendorService.getVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const fileName = `${this.supplierData.pk_companyID}_topProdcuts`;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Products");
      // Columns
      worksheet.columns = [
        { header: "Count", key: "timesOrdered", width: 10 },
        { header: "ID", key: "pk_productID", width: 10 },
        { header: "Name", key: "productName", width: 40 },
        { header: "Number", key: "productNumber", width: 20 }
      ];
      for (const obj of res["data"]) {
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
