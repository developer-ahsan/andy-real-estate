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
  initialReportData: any = [];
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
    public _reportService: ReportsService,
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
    if (!this._reportService.reporter.viewTopCustomerReport) {
      this._reportService.snackBar('You do not have permission to access this section.');
      return;
    }
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
      // top_customers_purchases: true,
      top_customers: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_id: this.selectedStores.pk_storeID,
      bln_cancel: this.blnShowCancelled,
      payment_status: this.paymentStatus,
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        let stores: any = Object.values(res["data"].reduce((acc, element) => {
          const { fk_storeID, storeName, userCounter, firstName, lastName, theTotal } = element;

          if (!acc[fk_storeID]) {
            acc[fk_storeID] = { data: [element], pk_storeID: fk_storeID, storeName, firstNameMaxUserCounter: firstName + ' ' + lastName, firstNameMaxtheTotal: firstName + ' ' + lastName, userCounter };
          } else {
            acc[fk_storeID].data.push(element);

            if (userCounter > acc[fk_storeID].userCounter) {
              acc[fk_storeID].firstNameMaxUserCounter = firstName + ' ' + lastName;
              acc[fk_storeID].userCounter = userCounter;
            }

            if (theTotal > acc[fk_storeID].data[0].theTotal) {
              acc[fk_storeID].firstNameMaxtheTotal = firstName + ' ' + lastName;
            }
          }

          return acc;
        }, {}));
        stores.sort((a, b) => a.storeName.localeCompare(b.storeName));
        this.generateReportData = stores;
        this.initialReportData = res["data"];
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
    if (this.initialReportData) {
      const stores: any = Object.values(this.initialReportData.reduce((acc, element) => {
        const { fk_storeID, storeName, userCounter, firstName, total } = element;

        if (!acc[fk_storeID]) {
          acc[fk_storeID] = { data: [element], pk_storeID: fk_storeID, storeName, firstNameMaxUserCounter: firstName };
        } else {
          acc[fk_storeID].data.push(element);

          if (userCounter > acc[fk_storeID].data[0].userCounter) {
            acc[fk_storeID].data[0].firstNameMaxUserCounter = firstName;
          }

          // Sort the data array based on the total (or userCounter, change as needed)
          if (event.direction == 'asc') {
            acc[fk_storeID].data.sort((a, b) => b.theTotal - a.theTotal);
          } else {
            acc[fk_storeID].data.sort((a, b) => a.theTotal - b.theTotal);
          }
        }

        return acc;
      }, {}));
      stores.sort((a, b) => a.storeName.localeCompare(b.storeName));
      this.generateReportData = stores;
      this._changeDetectorRef.markForCheck();
    }
  }

  downloadExcelWorkSheet() {
    this.generateExcelLoader = true;
    const fileName = `TopCustomer_${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("TopCustomer");
    // Columns
    let columns = [
      { header: "FK_STOREUSERID", key: "fk_storeUserID", width: 30 },
      { header: "FK_STOREID", key: "fk_storeID", width: 50 },
      { header: "USERCOUNTER", key: "userCounter", width: 40 },
      { header: "COMPANYNAME", key: "companyName", width: 30 },
      { header: "DAYPHONE", key: "dayPhone", width: 30 },
      { header: "ADDRESS1", key: "address1", width: 30 },
      { header: "STATE", key: "state", width: 30 },
      { header: "CITY", key: "city", width: 30 },
      { header: "ZIPCODE", key: "zipCode", width: 30 },
      { header: "FIRSTNAME", key: "firstName", width: 30 },
      { header: "LASTNAME", key: "lastName", width: 30 },
      { header: "LOCATIONNAME", key: "locationName", width: 30 },
      { header: "UNIT", key: "unit", width: 30 },
      { header: "DIVISION", key: "division", width: 30 },
      { header: "ORGANIZATION", key: "organization", width: 30 },
      { header: "THETOTAL", key: "theTotal", width: 30 },
    ]
    worksheet.columns = columns;
    for (const element of this.initialReportData) {
      worksheet.addRow(element);
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