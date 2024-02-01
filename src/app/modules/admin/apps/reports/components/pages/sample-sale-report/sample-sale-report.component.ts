import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddCoops, AddFOBLocation, DeleteCoops, RemoveFOBLocation, UpdateCoops } from '../../reports.types';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-sample-sale-report',
  templateUrl: './sample-sale-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportSampleSaleComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['date', 'id', 'company', 'paid', 'status', 'sa'];
  totalData = 0;
  reportPage: number = 1;
  generateReportData: any;
  isGenerateReportLoader: boolean;
  not_available = 'N/A';
  // ReportDropdowns
  blnShowCancelled = 0;
  ngStore = 637;

  allStores = [];
  selectedStores: any;
  todayDate = new Date();
  @ViewChild('topScrollAnchor') topScroll: ElementRef;
  @ViewChild('summaryScrollAnchor') summaryScrollAnchor: ElementRef;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _reportService: ReportsService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: 0 });
      res["data"].forEach(store => {
        if (store.blnActive) {
          this.allStores.push(store);
        }
      });
      this.selectedStores = this.allStores[0];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Reports
  generateReport(page) {
    if (!this._reportService.reporter.viewSamplesReport) {
      this._reportService.snackBar('You do not have permission to access this section.');
      return;
    }
    this.generateReportData = null;
    this.totalData = 0;
    this._reportService.setFiltersReport();
    this.isGenerateReportLoader = true;
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      samples_report: true,
      bln_cancel: this.blnShowCancelled,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_id: this.selectedStores.pk_storeID
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        res["data"].forEach(element => {
          this.totalData += element.numSales;
          element.storeDetails = [];
          let details;
          if (element.DETAILS) {
            details = element.DETAILS.split(',,');
            details.forEach(prod => {
              let data = prod.split('===');
              let sattusData = {
                statusColor: '',
                statusValue: ''
              };
              if (data[6] == 1) {
                sattusData.statusColor = 'text-red-700';
                sattusData.statusValue = 'Cancelled';
              } else if (data[7] == 1) {
                sattusData.statusColor = 'text-red-700';
                sattusData.statusValue = 'Closed';
              } else {
                sattusData = this._reportService.getStatusValue(data[4]);
              }
              element.storeDetails.push({ date: data[0], id: data[1], company: data[2], paid: data[3], status: sattusData.statusValue, statusColor: sattusData.statusColor, sa: data[5], blnCancelled: Number(data[6]), blnClosed: Number(data[7]), total: Number(data[8]), paymentDate: data[9], blnWarehouse: Number(data[10]) });
            });
          }
        });
        let orderCount = 0;
        res["data"].forEach((store) => {
          store.date_data = [];
          store.storeDetails.forEach(element => {
            orderCount += 1;
            element.orderCount = orderCount;
            let date_check = moment(element.date).format('MMM,yyyy');
            if (store.date_data.length == 0) {
              store.date_data.push({ date: moment(element.date).format('MMM,yyyy'), data: [element] });
            } else {
              const d_index = store.date_data.findIndex(date => date.date == date_check);
              if (d_index < 0) {
                store.date_data.push({ date: moment(element.date).format('MMM,yyyy'), data: [element] });
              } else {
                store.date_data[d_index].data.push(element);
              }
            }
          });
        });
        this.generateReportData = res["data"];
        this.backtoTop();
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
  getNextReportData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.reportPage++;
    } else {
      this.reportPage--;
    };
    this.generateReport(this.reportPage);
  };
  goToSummary() {
    setTimeout(() => {
      this.summaryScrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  backtoTop() {
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  trackById(index: number, item: any): number {
    return item.storeName;
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