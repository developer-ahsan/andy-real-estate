import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AddSizeChart, RemoveSizeChart, UpdateSizeChart } from '../../reports.types';

@Component({
  selector: 'app-royality-summary-report',
  templateUrl: './royality-summary-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RoyalitySummaryReportComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['store', 'name', 'percent', 'based', 'setting'];
  totalData = 0;
  page = 1;
  not_available = 'N/A';
  isLoadMore: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }
  ngOnInit(): void {
    this.isLoading = true;
    this.getRoyaltySummary();
  };
  getRoyaltySummary() {
    let params = {
      is_weekly: this._reportService.ngPlan == 'weekly' ? true : false,
      page: this.page,
      royalty_summaries: true,
      size: 50
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = this.dataSource.concat(res["data"]);
      this.totalData = res["totalRecords"];
      this.isLoadMore = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadMore = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();

    })
  }
  getNextData() {
    this.isLoadMore = true;
    this._changeDetectorRef.markForCheck();
    this.page++;
    this.getRoyaltySummary();
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
