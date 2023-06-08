import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import * as Excel from 'exceljs/dist/exceljs.min.js';

import { applyBlanketCustomerPercentage, newFLPSUser, newOrderManageUser, removeFLPSUser, RemoveUser, updateFLPSUser, updateOrderManageUser, updateOrderManageUserStores } from 'app/modules/admin/apps/royalities/components/royalities.types';
import { ReportsService } from '../../companies.service';
@Component({
  selector: 'app-report-filters',
  templateUrl: './report-filters.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportFiltersComponent implements OnInit, OnDestroy {
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
  monthlyMonth = 1;
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

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _reportsService: ReportsService
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
    this._reportsService.WeekDate = new Date();
    this._reportsService.monthlyMonth = 1;
    this._reportsService.monthlyYear = new Date().getFullYear();
    this._reportsService.quarterMonth = 1;
    this._reportsService.quarterYear = new Date().getFullYear();
    this._reportsService.yearlyYear = new Date().getFullYear();
    this._reportsService.ngRangeStart = new Date();
    this._reportsService.ngRangeEnd = new Date();
    this._reportsService.ngPlan = 'weekly';
    this._reportsService.startDate = moment(this.WeekDate).startOf('week').format('MM/DD/yyyy');
    this._reportsService.endDate = moment(this.WeekDate).endOf('week').format('MM/DD/yyyy');
    this._reportsService.reportType = 'Weekly Sales';
  }
  ngOnInit(): void {
    this.initForm();
  };
  changePlan(plan) {
    this.ngPlan = plan;
    this._reportsService.ngPlan = plan;
  }
  downloadExcelWorkSheet(data) {
    const fileName = `${this.selectedStore.storeName}-${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Customers");

    // Columns
    worksheet.columns = [
      { header: "License_Code", key: "License_Code", width: 30 },
      { header: "Institution_Short_Code", key: "Institution_Short_Code", width: 30 },
      { header: "Category_SubCategory_Code", key: "Category_SubCategory_Code", width: 30 },
      { header: "Prod_Description", key: "Prod_Description", width: 30 },
      { header: "Gross_Sales", key: "Gross_Sales", width: 30 },
      { header: "Total_Units", key: "Total_Units", width: 10 },
      { header: "Royalty_Sales", key: "Royalty_Sales", width: 10 },
      { header: "MRU_Units", key: "MRU_Units", width: 10 },
      { header: "Associated_Inst", key: "Associated_Inst", width: 10 },
      { header: "Retailer_Name", key: "Retailer_Name", width: 10 },
      { header: "IMGCL_Retailer_Code", key: "IMGCL_Retailer_Code", width: 10 },
      { header: "Address", key: "Address", width: 10 },
      { header: "City", key: "City", width: 10 },
      { header: "State", key: "State", width: 10 },
      { header: "Zip", key: "Zip", width: 10 },
      { header: "Invoice_Date", key: "Invoice_Date", width: 10 },
      { header: "Invoice_Number", key: "Invoice_Number", width: 10 },
      { header: "UPI", key: "UPI", width: 10 },
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
