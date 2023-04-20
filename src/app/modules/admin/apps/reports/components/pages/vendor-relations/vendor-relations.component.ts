import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-vendor-relations',
  templateUrl: './vendor-relations.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportVendorRelationsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  generateReportData: any;
  tempgenerateReportData: any;
  reportPage = 1;
  totalData = 0;
  temptotalData = 0;
  displayedColumns: string[] = ['id', 'company', 'relation', 'products'];

  vendorRelation = 1;
  isGenerateReportLoader: boolean;

  isSearching: boolean = false;
  keyword = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
  };
  // Reports
  generateReport(page) {
    if (page == 1) {
      this.reportPage = 1;
      if (this.generateReportData) {
        this.paginator.pageIndex = 0;
      }
      if (this.keyword == '') {
        this.generateReportData = null;
      }
      if (this.keyword != '') {
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
      }
    }
    if (this.keyword == '') {
      this.isGenerateReportLoader = true;
    }
    let params = {
      page: page,
      vendor_relations: true,
      relations: this.vendorRelation,
      keyword: this.keyword,
      size: 20
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.generateReportData = res["data"];
        this.totalData = res["totalRecords"];
        if (this.keyword == '') {
          this.tempgenerateReportData = res["data"];
          this.temptotalData = res["totalRecords"];
        }
      } else {
        this.generateReportData = null;
        this.tempgenerateReportData = null;
        this._reportService.snackBar('No records found');
      }
      this.isSearching = false;
      this.isGenerateReportLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
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
  resetSearch() {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.reportPage = 1;
      this.keyword = '';
      this.paginator.pageIndex = 0;
      this.generateReportData = this.tempgenerateReportData;
      this.totalData = this.temptotalData;
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
