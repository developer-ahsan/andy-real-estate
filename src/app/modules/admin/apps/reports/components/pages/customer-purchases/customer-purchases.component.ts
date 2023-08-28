import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl } from '@angular/forms';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { Sort } from '@angular/material/sort';
import moment from 'moment';
import * as Excel from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-customer-purchases',
  templateUrl: './customer-purchases.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportCustomerPurchaseComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['id', 'fName', 'lName', 'company', 'no', 'pv', 'tno', 'tpv'];

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
  initialData: any;
  totalsData: any;
  generateExcelLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private commonService: DashboardsService,
    private _reportService: ReportsService
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
    this.totalsData = {
      NO: 0,
      PV: 0,
      TNO: 0,
      TPV: 0,
      NC: 0
    }
    this.initialData = null;
    this._reportService.setFiltersReport();
    this.isGenerateReportLoader = true;
    let params = {
      customers_purchases: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_id: this.selectedStores.pk_storeID,
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        res["data"].forEach(element => {
          element.New_Customer = 'No';
          this.totalsData.NO += element.NO;
          this.totalsData.PV += element.PV;
          this.totalsData.TNO += element.TNO;
          this.totalsData.TPV += element.TPV;
          if (element.PV == element.TPV) {
            this.totalsData.NC += 1;
            element.New_Customer = 'Yes';
          }
        });
        this.generateReportData = res["data"];
        this.initialData = res["data"];
        this.totalData = res["totalRecords"];
      } else {
        this.initialData = null;
        this.generateReportData = null;
        this._reportService.snackBar('No records found');
      }
      this.isGenerateReportLoader = false;
      this.backtoTop();
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
  backtoTop() {
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  customSort(event: any) {
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

  // Compare function for sorting
  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  downloadExcelWorkSheet() {
    this.generateExcelLoader = true;
    const fileName = `CustomerPurchase_${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("CustomerPurchase");

    // Columns
    let columns = [
      { header: "UserID", key: "fk_storeUserID", width: 30 },
      { header: "FirstName", key: "firstName", width: 50 },
      { header: "LastName", key: "lastName", width: 40 },
      { header: "Email", key: "email", width: 30 },
      { header: "CompanyName", key: "companyName", width: 30 },
      { header: "NumberOfOrdersInRange", key: "NO", width: 30 },
      { header: "PurchaseValueInRange", key: "PV", width: 30 },
      { header: "TotalNumberOfPurchasesAllTime", key: "TNO", width: 30 },
      { header: "TotalPurchaseValueAllTime", key: "TPV", width: 30 },
      { header: "NewCustomer", key: "New_Customer", width: 30 }
    ]
    worksheet.columns = columns;
    for (const obj of this.generateReportData) {
      worksheet.addRow(obj);
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}