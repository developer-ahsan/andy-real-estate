import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationExtras, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SupportTicketService } from '../../support-tickets.service';
import { HideUnhideQuote } from '../../support-tickets.types';
@Component({
  selector: 'app-customer-invoice',
  templateUrl: './customer-invoice.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class CustomerInvoiceComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
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

  isLoading: boolean = false;
  selectedRoute = 'settings';

  exportsData: any = [];
  totalExportsData = 0;
  page = 1;
  isNextPageLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartCentService: SupportTicketService,
    private router: Router
  ) { }
  calledScreen(screen) {
    this.selectedRoute = screen;
  }
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
  }
  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.getExportsData(1);
  };
  getExportsData(page) {
    let params = {
      customer_exports: true,
      page: page,
      size: 10
    }
    this._smartCentService.getApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.exportsData = this.exportsData.concat(res["data"]);
      this.totalExportsData = res["totalRecords"];
      this.isNextPageLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isNextPageLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextPageData() {
    this.page++;
    this.isNextPageLoader = true;
    this.getExportsData(this.page);
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
