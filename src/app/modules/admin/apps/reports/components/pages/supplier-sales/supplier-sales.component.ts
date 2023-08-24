import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl } from '@angular/forms';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-supplier-sales',
  templateUrl: './supplier-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportsSupplierSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'cost', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];

  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;
  ngStore = 637;

  allSuppliers = [];
  searchSuppliersCtrl = new FormControl();
  selectedSuppliers: any;
  isSearchingSuppliers = false;
  isGenerateReportLoader: boolean;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getSuppliers();
  };
  getSuppliers() {
    this.commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(suppliers => {
        const activeSuppliers = suppliers["data"].filter(element => element.blnActiveVendor);
        this.allSuppliers.push(...activeSuppliers);
        this.selectedSuppliers = activeSuppliers[0];
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

    this.isGenerateReportLoader = true;
    let params = {
      page: page,
      store_sales__report: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      // stores_list: selectedStores.toString(),
      size: 20
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.generateReportData = res["data"];
        this.totalData = res["totalRecords"];
        this.generateReportData.forEach(element => {
          if (element.previousYearSales == 0) {
            element.percent = 0
          } else {
            element.percent = Number(100 - (element.monthlyEarnings / element.previousYearSales) * 100);
          }
          if (element.percent == 0) {
            element.percent = 0;
            element.color = 'gray';
          }
          if (element.percent < 0) {
            element.color = 'red';
          } else if (element.percent > 0) {
            element.color = 'green'
          } else {
            element.color = 'gray';
          }
          element.difference = Number(element.monthlyEarnings - element.previousYearSales);
          if (!element.difference) {
            element.difference = 0;
          }
          if (element.difference < 0) {
            element.difference = Math.abs(element.difference);
          }
          element.avg = Number(element.monthlyEarnings / element.NS);
          if (!element.avg) {
            element.avg = 0;
          }
          element.margin = Number(((element.price - element.cost) / element.price) * 100);
          if (!element.margin) {
            element.margin = 0;
          }
        });
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