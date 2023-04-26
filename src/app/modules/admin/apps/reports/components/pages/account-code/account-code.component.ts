import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';

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
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;
  isGenerateReportLoader: boolean;


  totalDataCalculations: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'Select a store', pk_storeID: 0 });
      this.allStores = this.allStores.concat(res["data"]);
      this.selectedStores = this.allStores[0];
      this.searchStoresCtrl.setValue(this.selectedStores);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchStoresCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          stores: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStores = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStores = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'Select a store', pk_storeID: 0 });
      this.allStores = this.allStores.concat(data["data"]);
    });
  }
  onSelectedStores(ev) {
    this.selectedStores = ev.option.value;
  }
  displayWithStores(value: any) {
    return value?.storeName;
  }
  // Reports
  generateReport() {
    if (this.selectedStores.pk_storeID == 0) {
      this._reportService.snackBar('Please select a store');
      return;
    }
    this.isGenerateReportLoader = true;
    let params = {
      account_code: true,
      store_list: this.selectedStores.pk_storeID
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.generateReportData = res["data"];
        let total = this.generateReportData[0].NO_Charge_Total;
        let totalSales = this.generateReportData[0].NO_Charge_Num_Sales;
        this.generateReportData.forEach(element => {
          total = total + element.SALES;
          totalSales = totalSales + element.Num_Sales;
        });
        this.totalDataCalculations = { total: total, totalSales: totalSales };
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
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  downloadExcelWorkSheet() {
    let data = [{ purchaseOrderNum: 'No Charge Code', CUSTOMER: '---', SALES: this.generateReportData[0].NO_Charge_Total, Num_Orders: this.generateReportData[0].NO_Charge_Num_Sales }];
    this.generateReportData = data.concat(this.generateReportData);
    const fileName = `AccountChargeCode_${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("AccountChargeCode");

    // Columns
    let columns = [
      { header: "AccountChargeCode", key: "purchaseOrderNum", width: 30 },
      { header: "CUSTOMER", key: "CUSTOMER", width: 50 },
      { header: "Total", key: "SALES", width: 40 },
      { header: "Num_Orders", key: "Num_Sales", width: 30 }
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