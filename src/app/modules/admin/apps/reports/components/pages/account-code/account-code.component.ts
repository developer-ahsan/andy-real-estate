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
        this.generateReportData = res["data"];
        let total = this.generateReportData[0].GRAND_SALES;
        let totalSales = this.generateReportData[0].GRAND_NUM_SALES;
        this.initialData = res["data"];
        // this.generateReportData.forEach(element => {
        //   total = total + element.SALES;
        //   totalSales = totalSales + element.NUM_SALES;
        // });
        this.totalDataCalculations = { total: total, totalSales: totalSales };
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
  sortData(event: Sort): void {
    // const data = this.generateReportData.slice(); // Create a copy of the data array

    // if (!sort.active || sort.direction === '') {
    //   this.generateReportData = data;
    //   return;
    // }

    // this.generateReportData = data.sort((a, b) => {
    //   const isAsc = sort.direction === 'asc';
    //   switch (sort.active) {
    //     case 'SALES':
    //       return this.compare(a.SALES, b.SALES, isAsc);
    //     default:
    //       return 0;
    //   }
    // });


    const sortHeaderId = event.active;
    const sortDirection = event.direction;

    if (sortDirection === '') {
      // Reset sorting, use your initial data here
      this.generateReportData = [...this.initialData];
      return;
    }

    // Perform sorting based on sortHeaderId and sortDirection
    // For example, using Array.sort() method:
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
      { header: "AccountChargeCode", key: "ACCOUNTCODE", width: 30 },
      { header: "CUSTOMER", key: "CUSTOMER", width: 50 },
      { header: "Total", key: "SALES", width: 40 },
      { header: "Num_Orders", key: "NUM_SALES", width: 30 }
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