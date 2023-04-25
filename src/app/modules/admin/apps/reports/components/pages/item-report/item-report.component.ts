import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddFOBLocation, RemoveFOBLocation } from '../../reports.types';
import moment from 'moment';

@Component({
  selector: 'app-item-report',
  templateUrl: './item-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportItemsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  storesList = [];
  storesLoader: boolean = false;
  storesPage = 1;
  totalStores = 0;

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];
  isGenerateReportLoader: boolean = false;

  // ReportDropdowns
  rangeBasedOn = 'order';
  blnShowCancelled = 0;
  paymentStatus = 1;
  ngStore = 637;
  ngSelectedColumns = ['setups', 'shipping', 'subtotal', 'paid', 'price', 'runs', 'zip', 'internalRoyalty'];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.getStores();
  };
  getStores() {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.isChecked = true;
        this.storesList.push(element);
      });
      this.totalStores = res["totalRecords"];
    });
  }
  getNextStoresList() {
    this.storesPage++;
    let params = {
      stores: true,
      size: 20,
      page: this.storesPage
    }
    this.storesLoader = true;
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.isChecked = true;
        this.storesList.push(element);
      });
      this.storesLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.storesLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  selectedUnSelected(check) {
    if (check) {
      this.storesList.forEach(element => {
        element.isChecked = true;
      });
    } else {
      this.storesList.forEach(element => {
        element.isChecked = false;
      });
    }
  }
  generateReport(page) {
    if (page == 1) {
      this.reportPage = 1;
      if (this.generateReportData) {
        this.paginator.pageIndex = 0;
      }
      this.generateReportData = null;
    }
    this._reportService.setFiltersReport();
    let selectedStores = [];
    this.storesList.forEach(element => {
      if (element.isChecked) {
        selectedStores.push(element.pk_storeID);
      }
    });
    if (selectedStores.length == 0) {
      this._reportService.snackBar('Please select at least 1 store');
      return;
    }
    this.isGenerateReportLoader = true;
    let params = {
      page: page,
      itemized_report: true,
      payment_status: this.paymentStatus,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      stores_list: selectedStores.toString(),
      rangeBasedOn: this.rangeBasedOn
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.downloadExcelWorkSheet(res["data"]);
      } else {
        this.generateReportData = null;
        this._reportService.snackBar('No records found');
      }
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  downloadExcelWorkSheet(data) {
    const fileName = `ItemReport_${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Items");

    // Columns
    let columns = [
      { header: "ID", key: "ID", width: 30 },
      { header: "Store", key: "storeName", width: 30 },
      { header: "InvoiceDate", key: "InvoiceDate", width: 30 },
      { header: "Customer", key: "CUSTOMER", width: 30 },
      { header: "Location", key: "Location", width: 30 },
      { header: "Item", key: "Item", width: 20 },
      { header: "Description", key: "Description", width: 60 },
      { header: "Quantity", key: "Quantity", width: 20 },
      { header: "ExtendedPrice", key: "ExtendedPrice", width: 20 }
    ]
    this.ngSelectedColumns.filter(item => {
      if (item == 'price') {
        columns.push(
          { header: "Price", key: "UnitPrice", width: 20 },
        )
      }
      if (item == 'setups') {
        columns.push(
          { header: "Setups", key: "setupPrice", width: 20 }
        )
      }
      if (item == 'shipping') {
        columns.push(
          { header: "Shipping", key: "shippingPrice", width: 20 }
        )
      }
      if (item == 'subtotal') {
        columns.push(
          { header: "Subtotal", key: "subTotal", width: 20 }
        )
      }
      if (item == 'paid') {
        columns.push(
          { header: "Paid", key: "paymentDate", width: 30 }
        )
      }

      if (item == 'runs') {
        columns.push(
          { header: "Runs", key: "Runs", width: 20 }
        )
      }

      if (item == 'internalRoyalty') {
        columns.push(
          { header: "InternalRoyalty", key: "InternalRoyalty", width: 20 }
        )
      }
      if (item == 'zip') {
        columns.push(
          { header: "BillingZip", key: "billingZip", width: 20 }
        )
      }
    });
    columns.push(
      { header: "CustomerPO", key: "CustomerPO", width: 20 },
      { header: "AccountChargeCode", key: "accountChargeCode", width: 20 },
      { header: "CostCenterCode", key: "CostCenterCode", width: 20 }
    );
    worksheet.columns = columns;
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
        this.isGenerateReportLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }, 500);

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