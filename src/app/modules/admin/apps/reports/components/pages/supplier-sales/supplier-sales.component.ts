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
  totalStoreSummary: any;
  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;

  allSuppliers = [];
  selectedSuppliers: any;
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
  generateReport() {
    this.generateReportData = null;
    this.totalStoreSummary = {
      PY: 0,
      percent: 0,
      DIFF: 0,
      NS: 0,
      PYNS: 0,
      COST: 0,
      PRICE: 0,
      blnPercent: false
    }
    this._reportService.setFiltersReport();

    this.isGenerateReportLoader = true;
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      supplier_sales: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      company_id: this.selectedSuppliers.pk_companyID,
      bln_cancel: this.blnShowCancelled,
      payment_status: this.paymentStatus,
      report_type: this.reportType,
      size: 20
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        res["data"].forEach(element => {
          if (element.COST > element.PY) {
            element.blnPercent = true;
            const diff = element.COST - element.PY;
            if (element.PY == 0) {
              element.percent = 100;
            } else {
              element.percent = Math.round((diff / element.PY) * 100);
            }
          } else if (element.COST < element.PY) {
            element.blnPercent = false;
            const diff = element.PY - element.COST;
            if (element.COST == 0) {
              element.percent = 100;
            } else {
              element.percent = Math.round((diff / element.PY) * 100);
            }
          } else {
            element.percent = 0;
          }
          this.totalStoreSummary.COST += element.COST;
          this.totalStoreSummary.PY += element.PY;
          this.totalStoreSummary.NS += element.NS;
          this.totalStoreSummary.PYNS += element.PYNS;
        });
        if (this.totalStoreSummary.COST > this.totalStoreSummary.PY) {
          this.totalStoreSummary.blnPercent = true;
          const diff = this.totalStoreSummary.COST - this.totalStoreSummary.PY;
          if (this.totalStoreSummary.PY == 0) {
            this.totalStoreSummary.percent = 100;
          } else {
            this.totalStoreSummary.percent = Math.round((diff / this.totalStoreSummary.PY) * 100);
          }
        } else if (this.totalStoreSummary.COST < this.totalStoreSummary.PY) {
          this.totalStoreSummary.blnPercent = false;
          const diff = this.totalStoreSummary.PY - this.totalStoreSummary.COST;
          if (this.totalStoreSummary.COST == 0) {
            this.totalStoreSummary.percent = 100;
          } else {
            this.totalStoreSummary.percent = Math.round((diff / this.totalStoreSummary.PY) * 100);
          }
        } else {
          this.totalStoreSummary.percent = 0;
        }
        this.generateReportData = res["data"];
        this.totalStoreSummary.DIFF = this.totalStoreSummary.COST - this.totalStoreSummary.PY;
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}