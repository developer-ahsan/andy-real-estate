import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateLocation } from '../../reports.types';
import { FormControl } from '@angular/forms';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-report-top-customer',
  templateUrl: './report-top-customer.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportTopCustomerComponent implements OnInit, OnDestroy {
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
    if (page == 1) {
      this.reportPage = 1;
      if (this.generateReportData) {
        this.paginator.pageIndex = 0;
      }
      this.generateReportData = null;
    }
    this._reportService.setFiltersReport();
    let selectedStores = [];
    this.allStores.forEach(element => {
      if (element.isChecked) {
        selectedStores.push(element.pk_storeID);
      }
    });
    this.isGenerateReportLoader = true;
    let params = {
      page: page,
      top_customers_report: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      stores_list: this.selectedStores.pk_storeID.toString(),
      size: 20
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.generateReportData = res["data"];
        this.totalData = res["totalRecords"];
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}