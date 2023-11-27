import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RoyaltyService } from '../../royalities.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

import { applyBlanketCustomerPercentage, newFLPSUser, newOrderManageUser, removeFLPSUser, RemoveUser, updateFLPSUser, updateOrderManageUser, updateOrderManageUserStores } from '../../royalities.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-royality-reports',
  templateUrl: './royality-reports.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RoyaltyReportsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'f_name', 'l_name', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;


  addNewUserForm: FormGroup;
  isAddNewUserLoader: boolean = false;

  updateUserForm: FormGroup;
  isUpdateUserLoader: boolean = false;
  isUpdateUser: boolean = false;
  updateUserData: any;

  mainScreen: string = 'Current Users';
  keyword = '';
  not_available = 'N/A';

  mainScreenUser: string = 'Edit User';
  // Active Stores
  allStores = [];
  storePage = 1;
  storeLoader: boolean = false;
  totalStores = 0;
  updateStoreLoader: boolean;

  ngReportType = 'c';
  planBillingForm: FormGroup;
  plans: any[];
  storesList = [];
  ngEmployee = 12885;
  ngPlan = 'weekly';
  maxDate = new Date();
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  month = 1;
  currentYear = new Date().getFullYear();
  years = [];

  quarter = 1;
  quarterly = [{
    value: 1,
    text: '1-3'
  },
  {
    value: 2,
    text: '4-6'
  },
  {
    value: 3,
    text: '7-9'
  },
  {
    value: 4,
    text: '10-12'
  }];


  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearching = false;
  minLengthTerm = 3;

  // Report
  WeekDate = new Date();
  monthlyMonth = this.WeekDate.getMonth() + 1;
  monthlyYear = new Date().getFullYear();
  quarterMonth = 1;
  quarterYear = new Date().getFullYear();
  yearlyYear = new Date().getFullYear();
  ngRangeStart = new Date();
  ngRangeEnd = new Date();

  generateReportLoader: boolean = false;
  isGenerateReport: boolean = false;
  reportParams: any;
  report_type = '';
  fileDownloadLoader: boolean;
  downloadFile: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _RoyaltyService: RoyaltyService,
    private _commonService: DashboardsService
  ) { }

  initForm() {
    for (let index = 0; index < 17; index++) {
      this.years.push(this.currentYear - index);
    }
    this.plans = [
      {
        value: 'weekly',
        label: 'Weekly',
        details: 'Choose a date.',
        price: '10'
      },
      {
        value: 'monthly',
        label: 'Monthly',
        details: 'Choose month and year.',
        price: '20'
      },
      {
        value: 'quarterly',
        label: 'Quarterly',
        details: 'Generate quarterly report.',
        price: '40'
      },
      {
        value: 'yearly',
        label: 'Yearly',
        details: 'Choose a year.',
        price: '40'
      },
      {
        value: 'range',
        label: 'Range',
        details: 'Generate range report.',
        price: '40'
      }
    ];
    let params;
    this.searchStoreCtrl.valueChanges.pipe(
      filter(res => {
        params = {
          stores_list: true,
          keyword: res
        }
        return res !== null && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        this.storesList = [];
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._RoyaltyService.getCallsData(params)
        .pipe(
          finalize(() => {
            this.isSearching = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.storesList = data['data'];
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getStores();
    this.setCurrentQuarter();
    this.isLoading = true;
  };
  getStores() {
    this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(stores => {
      stores["data"].forEach(element => {
        if (element.blnActive) {
          this.storesList.push(element);
        }
      });
      this.selectedStore = this.storesList[0];
    });
  }
  setCurrentQuarter() {
    if (this.monthlyMonth >= 1 && (this.monthlyMonth <= 3)) {
      this.quarterMonth = 1
    } else if (this.monthlyMonth >= 4 && (this.monthlyMonth <= 6)) {
      this.quarterMonth = 2
    } else if (this.monthlyMonth >= 7 && (this.monthlyMonth <= 9)) {
      this.quarterMonth = 3
    } else {
      this.quarterMonth = 4
    }
  }
  onSelected(ev) {
    this.selectedStore = ev.option.value;
  }
  displayWith(value: any) {
    return value ? value?.storeName : '';
  }
  generateReport() {
    if (!this.selectedStore) {
      this._RoyaltyService.snackBar('Please select any store');
      return;
    }

    this.downloadFile = false;
    this.generateReportLoader = true;

    const dateRange = this.getDateRange();
    this.reportParams = {
      page: this.page,
      start_date: dateRange.start,
      end_date: dateRange.end,
      store_id: this.selectedStore.pk_storeID,
      options_report: true
    };

    this._RoyaltyService.getCallsData(this.reportParams)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        res => {
          if (res["data"].length === 0) {
            this._RoyaltyService.snackBar('No data have been found in the specified range that match your criteria.');
          } else {
            this.downloadFile = true;
          }

          this.generateReportLoader = false;
          this.isGenerateReport = true;
          this.dataSource = res["data"];
          this.totalUsers = res["totalRecords"];
          this._changeDetectorRef.markForCheck();
        },
        err => {
          this.generateReportLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      );
  }
  // Helper function to get date range based on ngPlan
  getDateRange(): { start: moment.Moment, end: moment.Moment } {
    let start
    let end;

    switch (this.ngPlan) {
      case 'weekly':
        start = moment(this.WeekDate).startOf('isoWeek').format('MM/DD/yyyy');
        end = moment(this.WeekDate).endOf('isoWeek').format('MM/DD/yyyy');
        break;
      case 'monthly':
        let date: any = new Date(this.monthlyYear, this.monthlyMonth - 1, 1);
        start = moment(date).startOf('month').format('MM/DD/yyyy');
        end = moment(date).endOf('month').format('MM/DD/yyyy');
        break;
      case 'quarterly':
        let s;
        let e;
        if (this.quarterMonth == 1) {
          s = new Date(this.quarterYear, 0, 1);
          e = new Date(this.quarterYear, 2, 1);
        } else if (this.quarterMonth == 2) {
          s = new Date(this.quarterYear, 3, 1);
          e = new Date(this.quarterYear, 5, 1);
        } else if (this.quarterMonth == 3) {
          s = new Date(this.quarterYear, 6, 1);
          e = new Date(this.quarterYear, 8, 1);
        } else if (this.quarterMonth == 4) {
          s = new Date(this.quarterYear, 9, 1);
          e = new Date(this.quarterYear, 11, 1);
        }
        start = moment(s).startOf('month').format('MM/DD/yyyy');
        end = moment(e).endOf('month').format('MM/DD/yyyy');
        break;
      case 'yearly':
        let d = new Date(this.yearlyYear, 0, 1);
        start = moment(d).startOf('year').format('MM/DD/yyyy');
        end = moment(d).endOf('year').format('MM/DD/yyyy');
        break;
      case 'range':
        start = moment(this.ngRangeStart).format('MM/DD/yyyy');
        end = moment(this.ngRangeEnd).format('MM/DD/yyyy');
        break;
    }

    return { start, end };
  }
  downloadExcelWorkSheet() {
    const fileName = `${this.selectedStore.storeName}-${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Customers");

    // Columns
    worksheet.columns = [
      { header: "License_Code", key: "License_Code", width: 20 },
      { header: "Institution_Short_Code", key: "Institution_Short_Code", width: 30 },
      { header: "Category_SubCategory_Code", key: "Category_SubCategory_Code", width: 30 },
      { header: "Prod_Description", key: "Prod_Description", width: 30 },
      { header: "Gross_Sales", key: "Gross_Sales", width: 30 },
      { header: "Total_Units", key: "Total_Units", width: 10 },
      { header: "Royalty_Sales", key: "Royalty_Sales", width: 10 },
      { header: "MRU_Units", key: "MRU_Units", width: 10 },
      { header: "Associated_Inst", key: "Associated_Inst", width: 10 },
      { header: "Retailer_Name", key: "Retailer_Name", width: 30 },
      { header: "IMGCL_Retailer_Code", key: "IMGCL_Retailer_Code", width: 10 },
      { header: "Address", key: "Address", width: 30 },
      { header: "City", key: "City", width: 10 },
      { header: "State", key: "State", width: 10 },
      { header: "Zip", key: "Zip", width: 10 },
      { header: "Invoice_Date", key: "Invoice_Date", width: 10 },
      { header: "Invoice_Number", key: "Invoice_Number", width: 10 },
      { header: "UPI", key: "UPI", width: 10 },
    ];
    let code = '';
    for (const obj of this.dataSource) {
      if (obj.LTSCCode) {
        code = obj.LTSCCode;
      }
      obj.Category_SubCategory_Code = obj.LTCode + '-' + code
      obj.Invoice_Date = moment(obj.Invoice_Date).format('yyyy-MM-DD')
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
  }
  backToSearch() {
    this.downloadFile = false;
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
