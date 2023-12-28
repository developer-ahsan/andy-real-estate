import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-location-sales',
  templateUrl: './location-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportsLocationSalesComponent implements OnInit, OnDestroy {
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

  @ViewChild('paginator') paginator: MatPaginator;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  generateReportData: any;
  reportPage = 1;
  totalData = 0;
  displayedColumns: string[] = ['store', 'sales', 'py', 'percent', 'difference', 'n_sales', 'pyns', 'avg', 'margin'];

  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;
  blnYTD = 0;
  blnIndividualOrders = 0;
  attribute_id: any;
  location_id = 0;

  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;
  isGenerateReportLoader: boolean;
  lastYearTotal: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    let params = {
      location_stores: true
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(stores => {
        let details = stores.details;
        stores.Locations = [{ id: 0, name: 'All top level locations', subLocations: [{ id: 0, name: 'All sub level locations' }] }];
        if (details) {
          let top_locations = details.split(',,');
          top_locations.forEach((top_location, index) => {
            let locations = top_location?.split('||');
            let t_location = locations[0].split('::');
            stores.Locations.push({ id: Number(t_location[0]), name: t_location[1], subLocations: [{ id: 0, name: 'All sub level locations' }] });
            let subLocations;
            if (locations.length > 1) {
              subLocations = locations[1].split('##');
              subLocations.forEach(subLocation => {
                let S_location = subLocation.split('::');
                stores.Locations[index + 1].subLocations.push({ id: Number(S_location[0]), name: S_location[1] });
              });
            }
          });
        }
      });
      this.isLoading = false;
      this.allStores = res["data"];
      this.selectedStores = this.allStores[0];
      this.attribute_id = this.selectedStores.Locations[0];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  onSelectedStores(ev) {
    this.selectedStores = ev.value;
    this.attribute_id = this.selectedStores.Locations[0];
    this.location_id = 0;
  }
  backtoTop() {
    setTimeout(() => {
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  // Reports
  generateReport(page) {
    this.lastYearTotal = {
      blnPercent: false,
      Sales: 0,
      PY: 0,
      Percent: 0,
      NS: 0,
      PYNS: 0
    }
    this.generateReportData = null;
    this._reportService.setFiltersReport();
    if (this.selectedStores.pk_storeID == 0) {
      this._reportService.snackBar('Please select a store');
      return;
    }
    this.isGenerateReportLoader = true;
    let is_weekly = false;
    if (this._reportService.ngPlan == 'weekly') {
      is_weekly = true;
    }
    let params = {
      is_weekly,
      location_sales_report: true,
      start_date: this._reportService.startDate,
      end_date: this._reportService.endDate,
      store_list: this.selectedStores.pk_storeID,
      payment_status: this.paymentStatus,
      report_type: this.reportType,
      show_cancelled_order: this.blnShowCancelled,
      attribute_id: this.attribute_id.id,
      location_id: this.location_id,
      is_individual: this.blnIndividualOrders,
      is_ytd: this.blnYTD
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.generateReportData = res;
      this.generateReportData["report_summary"].forEach(element => {
        element.MARGIN = Number(element.MARGIN).toFixed(2)
        if (element.SALES > element.PY) {
          element.blnPercent = true;
          const diff = element.SALES - element.PY;
          if (element.PY == 0) {
            element.percent = 100;
          } else {
            element.percent = Math.round((diff / element.PY) * 100);
          }
        } else if (element.SALES < element.PY) {
          element.blnPercent = false;
          const diff = element.PY - element.SALES;
          if (element.SALES == 0) {
            element.percent = 100;
          } else {
            element.percent = Math.round((diff / element.PY) * 100);
          }
        } else {
          element.percent = 0;
        }

      });
      if (this.generateReportData["lastYear_report_summary"].length > 0) {
        this.generateReportData["lastYear_report_summary"].forEach(element => {
          if (element.SALES > element.PY) {
            element.blnPercent = true;
            const diff = element.SALES - element.PY;
            if (element.PY == 0) {
              element.percent = 100;
            } else {
              element.percent = Math.round((diff / element.PY) * 100);
            }
          } else if (element.SALES < element.PY) {
            element.blnPercent = false;
            const diff = element.PY - element.SALES;
            if (element.SALES == 0) {
              element.percent = 100;
            } else {
              element.percent = Math.round((diff / element.PY) * 100);
            }
          } else {
            element.percent = 0;
          }
          this.lastYearTotal.Sales += element.Sale;
          this.lastYearTotal.PY += element.PY;
          this.lastYearTotal.NS += element.NS;
          this.lastYearTotal.PYNS += element.PYNS;
        });
        if (this.lastYearTotal.Sales > this.lastYearTotal.PY) {
          this.lastYearTotal.blnPercent = true;
          const diff = this.lastYearTotal.Sales - this.lastYearTotal.PY;
          if (this.lastYearTotal.PY == 0) {
            this.lastYearTotal.Percent = 100;
          } else {
            this.lastYearTotal.Percent = Math.round((diff / this.lastYearTotal.PY) * 100);
          }
        } else if (this.lastYearTotal.Sales < this.lastYearTotal.PY) {
          this.lastYearTotal.blnPercent = false;
          const diff = this.lastYearTotal.PY - this.lastYearTotal.Sales;
          if (this.lastYearTotal.Sales == 0) {
            this.lastYearTotal.Percent = 100;
          } else {
            this.lastYearTotal.Percent = Math.round((diff / this.lastYearTotal.PY) * 100);
          }
        } else {
          this.lastYearTotal.Percent = 0;
        }
      } else {
        this.generateReportData["lastYear_report_summary"].push({ storeName: this.selectedStores.storeName, SALES: 0, PY: 0, percent: 0, NS: 0, PYNS: 0 });
      }
      this.backtoTop();
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