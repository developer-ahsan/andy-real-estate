import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ApplyBlanketFOBlocation, updateCompanySettings } from '../../reports.types';
import moment from 'moment';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { CurrencyPipe } from '@angular/common';
import { Sort } from '@angular/material/sort';
import { environment } from 'environments/environment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-royalities-reports',
  templateUrl: './royalities-reports.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RoyalitiesReportComponent implements OnInit, OnDestroy {
  pageCheck = 'Royalties';
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean = false;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchLocationCtrl = new FormControl();
  selectedLocation: any;
  isSearchingLocation = false;

  allLocations = [];
  // ReportDropdowns
  royaltyID: any = 0;
  blnIncludeFulfillment = 0;
  paymentStatus = 1;
  ngStore = 637;

  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;

  royaltiesPerStore: any;
  royaltiesPerStoreCheck: boolean = true;
  isLoadingRoyalties: boolean = false;

  isGenerateReportLoader: boolean;
  generateReportData: any;
  initialData: any;
  reportPage = 1;
  totalSales = 0;
  totalRoyalities = 0;
  displayedColumns: string[] = ['order', 'payment', 'id', 'company', 'sale', 'royalty', 'paid', 'status'];
  serverCurrentDate = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _reportService: ReportsService, private currencyPipe: CurrencyPipe,
  ) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
    this.getCurrentDate();
  };
  getCurrentDate() {
    this._reportService.currentDate$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.serverCurrentDate = res["currentDate"];
    })
  }
  getStores() {
    let param = {
      royalty_stores: true
    }
    this._reportService.getRoyaltyStores(param).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'Select a store', fk_storeID: '' });
      this.allStores = this.allStores.concat(res["data"]);
      this.selectedStores = this.allStores[0];
      this.royaltiesPerStore = null;
      this.royaltiesPerStoreCheck = true;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      // this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });

  }
  onSelectedStores() {
    this.royaltiesPerStoreCheck = true;
    this.royaltiesPerStore = null;
    if (this.selectedStores.fk_storeID != '') {
      this.royaltiesPerStoreData();
    } else {
      this._reportService.snackBar('Please select any store');
    }
  }
  royaltiesPerStoreData() {
    this.isLoadingRoyalties = true;
    let params = {
      royalty_per_store: true,
      store_id: this.selectedStores.fk_storeID
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.royaltiesPerStore = res["data"];
      this.royaltiesPerStoreCheck = false;
      this.isLoadingRoyalties = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.royaltiesPerStoreCheck = false;
      this.isLoadingRoyalties = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Reports
  generateReport(page) {
    if (!this._reportService.reporter.viewRoyaltiesReport) {
      this._reportService.snackBar('You do not have permission to access this section.');
      return;
    }
    if (this.royaltyID == 0 || this.selectedStores.fk_storeID == '') {
      this._reportService.snackBar('You must select a store and report type above before you can generate the report.');
      return;
    }
    this.totalRoyalities = 0;
    this.totalSales = 0;
    this.generateReportData = null;
    this._reportService.setFiltersReport();
    this.isGenerateReportLoader = true;
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      royalty_reports: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_id: this.selectedStores.fk_storeID,
      blnIncludeFulfillment: this.blnIncludeFulfillment,
      payment_status: this.paymentStatus
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        res["data"].forEach(element => {
          this.totalSales = element.grandTotalThisOrderTotal;
          this.totalRoyalities = element.grandTotalRoyalties;
          if (moment(new Date()).diff(moment(new Date(element.paymentDate))) >= 0) {
            element.paid = true;
          } else {
            element.paid = false;
          }
          this.setReportStatus(element);
        });
        this.generateReportData = res["data"];
        this.initialData = res["data"];
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
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
  setReportStatus(report) {
    const status = report.orderLinesStatus?.split('|').map(Number);
    let statusColor = '';
    let statusValue = '';
    let textColor = '';
    if (status) {
      switch (true) {
        case status.includes(1):
        case status.includes(2):
        case status.includes(3):
        case status.includes(4):
          statusValue = 'Processing';
          statusColor = 'text-red-500';
          textColor = 'red';
          break;
        case status.includes(7):
          statusValue = 'P.O. Needed';
          statusColor = 'text-purple-500';
          textColor = 'purple';
          break;
        default:
          statusValue = 'Shipped';
          statusColor = 'text-green-500';
          textColor = 'green';
          break;
      }
    } else {
      statusValue = 'N/A';
    }
    report.status = { statusColor, statusValue, textColor };
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
          return new Date(valueA).getTime() - new Date(valueB).getTime();
        } else {
          return new Date(valueB).getTime() - new Date(valueA).getTime();
        }
      }
    });
  }
  backToList() {
    this.generateReportData = null;
    this._changeDetectorRef.markForCheck();
  }
  generatePdf() {
    const documentDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [10, 10, 10, 10],
      content: [
        // Add a title for your PDF
        { text: this._reportService.reportType.toUpperCase(), fontSize: 14 },
        { text: 'Range: ' + this._reportService.startDate + ' - ' + this._reportService.endDate, fontSize: 10 },
        // Add a spacer element to create a margin above the table
        { text: '', margin: [0, 20, 0, 0] },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*'],
            body: [
              [
                { text: '#', bold: true },
                { text: 'Order Date', bold: true },
                { text: 'Payment Date', bold: true },
                { text: 'ID', bold: true },
                { text: 'Company', bold: true },
                { text: 'Sales', bold: true },
                { text: 'Royalties', bold: true },
                { text: 'Paid', bold: true },
                { text: 'Status', bold: true }
              ]
            ]
          },
          fontSize: 8
        }
      ],
      styles: {
        tableHeader: {
          bold: true
        }
      }
    };
    this.generateReportData.forEach((element, key) => {
      documentDefinition.content[3].table.body.push(
        [
          key + 1,
          element.orderDate,
          element.paymentDate,
          { text: element.pk_orderID, link: `${environment.siteDomain}apps/orders/'${element.pk_orderID}` },
          element.companyName,
          { text: this.currencyPipe.transform(Number(element.thisOrderTotal), 'USD', 'symbol', '1.2-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          { text: this.currencyPipe.transform(Number(element.Royalties), 'USD', 'symbol', '1.2-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          { text: element.paid ? 'Paid' : 'Not Paid', color: element.paid ? 'green' : 'red', bold: true },
          { text: element.status.statusValue, color: element.status.textColor, bold: true }
        ]
      )
    });
    documentDefinition.content[3].table.body.push(
      [
        'Totals: ',
        '',
        '',
        '',
        '',
        { text: this.currencyPipe.transform(Number(this.totalSales), 'USD', 'symbol', '1.2-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
        { text: this.currencyPipe.transform(Number(this.totalRoyalities), 'USD', 'symbol', '1.2-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
        '',
        ''
      ]
    )
    pdfMake.createPdf(documentDefinition).download(`${this.selectedStores.storeName}-Royalty-Report-${this._reportService.startDate}-${this._reportService.endDate}.pdf`);
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