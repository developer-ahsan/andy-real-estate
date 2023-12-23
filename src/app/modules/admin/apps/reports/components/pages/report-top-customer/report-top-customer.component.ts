import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateLocation } from '../../reports.types';
import { FormControl } from '@angular/forms';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { Sort } from '@angular/material/sort';
import moment from 'moment';
import * as Excel from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-report-top-customer',
  templateUrl: './report-top-customer.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportTopCustomerComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;

  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['id', 'customer', 'company', 'phone', 'address', 'sale', '#'];

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

  generateExcelLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }
  ngOnInit(): void {
    this.getStores();
  };
  getStores() {
    this.commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.allStores.push({ storeName: 'All Stores', pk_storeID: 0 });
        const activeStores = res["data"].filter(element => element.blnActive);
        this.allStores.push(...activeStores);
        this.selectedStores = this.allStores[0];
      });
  }

  // Reports
  generateReport(page) {
    this.generateReportData = null;
    this._reportService.setFiltersReport();
    let selectedStores = [];
    this.allStores.forEach(element => {
      if (element.isChecked) {
        selectedStores.push(element.pk_storeID);
      }
    });
    this.isGenerateReportLoader = true;
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      top_customers_purchases: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_id: this.selectedStores.pk_storeID,
      bln_cancel: this.blnShowCancelled,
      payment_status: this.paymentStatus,
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        res["data"].forEach(stores => {
          stores.topCustomer = null;
          stores.topSales = null;
          let detail = stores.Details;
          stores.customers = [];
          if (detail) {
            let customers = detail.split(',,');
            for (const element of customers) {
              const customer = element.split('::');
              const [id, firstName, lastName, company, location, phone, street1, city, state, zip, sale, counter, unit, division, organisation] = customer;
              const name = `${firstName} ${lastName}`;
              const address = `${street1} ${city}, ${state} ${zip}`;
              const saleAmount = Number(sale);
              const counterValue = Number(counter);
              const existingCustomer = stores.customers.find(cust => cust.id === id);
              if (existingCustomer) {
                existingCustomer.sale += saleAmount;
                existingCustomer.counter += counterValue;
              } else {
                stores.customers.push({ storeID: stores.pk_storeID, id, name, company, phone, address, street1, city, zip, sale: saleAmount, counter: counterValue, unit, division, organisation, firstName, lastName, state, location });
              }
            }
            stores.customers.sort((a, b) => b.sale - a.sale);
            let largestCounterIndex = 0;
            for (let i = 1; i < stores.customers.length; i++) {
              if (stores.customers[i].counter > stores.customers[largestCounterIndex].counter) {
                largestCounterIndex = i;
              }
            }
            if (stores.customers.length > 0) {
              stores.topCustomer = { name: stores.customers[0].name, id: stores.customers[0].id };
              stores.topSales = { name: stores.customers[largestCounterIndex].name, id: stores.customers[largestCounterIndex].id };
            }
          }
        });

        this.generateReportData = res["data"];
        this.totalData = res["totalRecords"];
      } else {
        this.generateReportData = null;
        this._reportService.snackBar('No records found');
      }
      this.backtoTop();
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backtoTop() {
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  customSort(event: Sort) {
    this.generateReportData.forEach(element => {
      const data = element.customers.slice();
      if (!event.active || event.direction === '') {
        element.customers = data;
        return;
      }

      const sortedData = data.sort((a, b) => {
        const isAsc = event.direction === 'asc';
        return this.compare(a.sale, b.sale, isAsc);
      });
      element.customers = sortedData;
    });
  }

  // Compare function for sorting
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  downloadExcelWorkSheet() {
    this.generateExcelLoader = true;
    const fileName = `TopCustomer_${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("TopCustomer");
    // Columns
    let columns = [
      { header: "FK_STOREUSERID", key: "id", width: 30 },
      { header: "FK_STOREID", key: "storeID", width: 50 },
      { header: "USERCOUNTER", key: "counter", width: 40 },
      { header: "COMPANYNAME", key: "company", width: 30 },
      { header: "DAYPHONE", key: "phone", width: 30 },
      { header: "ADDRESS1", key: "street1", width: 30 },
      { header: "STATE", key: "state", width: 30 },
      { header: "CITY", key: "city", width: 30 },
      { header: "ZIPCODE", key: "zip", width: 30 },
      { header: "FIRSTNAME", key: "firstName", width: 30 },
      { header: "LASTNAME", key: "lastName", width: 30 },
      { header: "LOCATIONNAME", key: "location", width: 30 },
      { header: "UNIT", key: "unit", width: 30 },
      { header: "DIVISION", key: "division", width: 30 },
      { header: "ORGANIZATION", key: "organisation", width: 30 },
      { header: "THETOTAL", key: "sale", width: 30 },
    ]
    worksheet.columns = columns;
    for (const element of this.generateReportData) {
      for (const customer of element.customers) {
        worksheet.addRow(customer);
      }
    }
    workbook.xlsx.writeBuffer()
      .then((data: any) => {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        return URL.createObjectURL(blob);
      })
      .then(url => {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        this.generateExcelLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  goToSummary() {
    setTimeout(() => {
      this.summaryScrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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