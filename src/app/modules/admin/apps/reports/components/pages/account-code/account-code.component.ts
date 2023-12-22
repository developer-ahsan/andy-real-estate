import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-account-code',
  templateUrl: './account-code.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportAccountCodeComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['code', 'customer', 'sales', 'n_sales'];
  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;
  ngStore = 637;

  allStores = [];
  selectedStores: any;
  isGenerateReportLoader: boolean;


  totalDataCalculations: any;
  initialData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    this.commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        const activeStores = res["data"].filter(element => element.blnActive);
        this.allStores.push(...activeStores);
        this.selectedStores = this.allStores[0];
      });
  }
  // Reports
  generateReport() {
    if (this.selectedStores.pk_storeID == 0) {
      this._reportService.snackBar('Please select a store');
      return;
    }
    this.generateReportData = null;
    this.initialData = null;
    this.totalDataCalculations = { total: 0, totalSales: 0 };
    this._reportService.setFiltersReport();
    this.isGenerateReportLoader = true;
    let is_weekly = false;
    if (this._reportService.ngPlan == 'weekly') {
      is_weekly = true;
    }
    let params = {
      account_code: true,
      store_id: this.selectedStores.pk_storeID,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      payment_status: this.paymentStatus,
      is_weekly,
      report_type: this.reportType
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.accountChargeCodeFormat(res["data"]);
      } else {
        this.generateReportData = null;
        this.initialData = null;
        this._reportService.snackBar('No records found');
      }
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  accountChargeCodeFormat(qryOrders) {
    let GRAND_SALES = 0;
    let GRAND_NUM_SALES = 0;
    const strReport = { qryReturn: [] };

    const findAndUpdate = (code, total, firstName, lastName, locationName, companyName) => {
      for (let ii = 0; ii < strReport.qryReturn.length; ii++) {
        if (strReport.qryReturn[ii].accountChargeCode === code) {
          strReport.qryReturn[ii].Total += total;
          strReport.qryReturn[ii].numOrders += 1;
          GRAND_SALES += total;
          GRAND_NUM_SALES += 1;
          return true;
        }
      }
      return false;
    };

    const processOrder = (code, total, firstName, lastName, locationName, companyName) => {
      const customer = `${firstName} ${lastName}${locationName ? ` - ${locationName}` : companyName ? ` - ${companyName}` : ''}`;
      const newOrder = {
        accountChargeCode: code,
        Customer: code === 'No Charge Code' ? '---' : customer,
        Total: total,
        numOrders: 1,
      };

      // Add the new order at the beginning of the array
      strReport.qryReturn.unshift(newOrder);

      GRAND_SALES += total;
      GRAND_NUM_SALES += 1;
      return true;
    };

    for (let i = 0; i < qryOrders.length; i++) {
      const { purchaseOrderNum, accountChargeCode, total, firstName, lastName, locationName, companyName } = qryOrders[i];

      let blnFound = false;

      if (purchaseOrderNum && purchaseOrderNum.length) {
        blnFound = findAndUpdate(purchaseOrderNum, total, firstName, lastName, locationName, companyName);
        if (!blnFound) processOrder(purchaseOrderNum, total, firstName, lastName, locationName, companyName);
      } else if (accountChargeCode && accountChargeCode.length) {
        blnFound = findAndUpdate(accountChargeCode, total, firstName, lastName, locationName, companyName);
        if (!blnFound) processOrder(accountChargeCode, total, firstName, lastName, locationName, companyName);
      } else {
        blnFound = findAndUpdate('No Charge Code', total, firstName, lastName, locationName, companyName);
        if (!blnFound) processOrder('No Charge Code', total, firstName, lastName, locationName, companyName);
      }
    }

    this.generateReportData = strReport.qryReturn;
    this.initialData = strReport.qryReturn;
    this.totalDataCalculations = { total: GRAND_SALES, totalSales: GRAND_NUM_SALES };
  }
  sortData(event: Sort): void {
    const sortHeaderId = event.active;
    const sortDirection = event.direction;

    if (sortDirection === '') {
      this.generateReportData = [...this.initialData];
      return;
    }
    this.generateReportData.sort((a, b) => {
      const valueA = a[sortHeaderId];
      const valueB = b[sortHeaderId];
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        if (sortDirection === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      } else {
        if (sortDirection === 'asc') {
          return valueA.toString().localeCompare(valueB.toString());
        } else {
          return valueB.toString().localeCompare(valueA.toString());
        }
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  downloadExcelWorkSheet() {
    // let data = [{ purchaseOrderNum: 'No Charge Code', CUSTOMER: '---', SALES: this.generateReportData[0].NO_Charge_Total, Num_Orders: this.generateReportData[0].NO_Charge_Num_Sales }];
    // this.generateReportData = data.concat(this.generateReportData);
    const fileName = `AccountChargeCode_${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("AccountChargeCode");

    // Columns
    let columns = [
      { header: "AccountChargeCode", key: "accountChargeCode", width: 30 },
      { header: "CUSTOMER", key: "Customer", width: 50 },
      { header: "Total", key: "Total", width: 40 },
      { header: "Num_Orders", key: "numOrders", width: 30 }
    ]
    worksheet.columns = columns;
    for (const obj of this.generateReportData) {
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