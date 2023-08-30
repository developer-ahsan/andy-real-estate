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

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-royalities-reports',
  templateUrl: './royalities-reports.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RoyalitiesReportComponent implements OnInit, OnDestroy {
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
  reportPage = 1;
  totalSales = 0;
  totalRoyalities = 0;
  displayedColumns: string[] = ['order', 'payment', 'id', 'company', 'sale', 'royalty', 'paid', 'status'];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService, private currencyPipe: CurrencyPipe,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
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
          if (moment(new Date()).diff(moment(element.paymentDate)) >= 0) {
            element.paid = true;
          } else {
            element.paid = false;
          }
          let status = '5';
          let orderLinesStatus = element.orderLinesStatus.split('|');
          orderLinesStatus.forEach(_status => {
            if (_status == 1 || _status == 2 || _status == 3 || _status == 4) {
              status = '7';
            } else if (_status == 7) {
              status = '1';
            } else {
              status = '5';
            }
          });
          element.status = this._reportService.getStatusValue(status);
        });
        this.generateReportData = res["data"];
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
        { text: this._reportService.ngPlan.toUpperCase(), fontSize: 14 },
        { text: 'Range: ' + this._reportService.startDate + ' - ' + this._reportService.endDate, fontSize: 10 },
        // Add a spacer element to create a margin above the table
        { text: '', margin: [0, 20, 0, 0] },
        {
          table: {
            widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
            body: [
              [
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
    this.generateReportData.forEach(element => {
      documentDefinition.content[3].table.body.push(
        [
          moment(element.orderDate).format('MM-DD-yyyy'),
          moment(element.paymentDate).format('MM-DD-yyyy'),
          element.pk_orderID,
          element.companyName,
          { text: this.currencyPipe.transform(Number(element.thisOrderTotal), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          { text: this.currencyPipe.transform(Number(element.Royalties), 'USD', 'symbol', '1.0-2', 'en-US'), bold: true, margin: [0, 3, 0, 3] },
          element.paid ? 'Paid' : 'Not Paid',
          element.status.statusValue
        ]
      )
    });
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