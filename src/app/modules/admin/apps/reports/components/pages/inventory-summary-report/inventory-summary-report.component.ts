import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-inventory-summary-report',
  templateUrl: './inventory-summary-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportInventorySummaryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['pid', 'spid', 'sid', 'store', 'product', 'inventory', 'threshold'];
  totalData = 0;
  page = 1;


  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;
  isGenerateReportLoader: boolean;

  keyword = '';
  inventory = 0;
  generateReportData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService,
    private commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    // inventory_summary_stores
    this.commonService.storesData$.pipe(
      takeUntil(this._unsubscribeAll),
      map(res => res["data"].filter(element => element.blnActive))
    ).subscribe(filteredData => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: '' });
      this.allStores.push(...filteredData);
      this.selectedStores = this.allStores[0];
      this.generateReport(1);
    });
  }


  generateReport(page) {
    if (page == 1) {
      this.page = 1;
      if (this.generateReportData) {
        this.paginator.pageIndex = 0;
      }
    }
    let is_weekly = false;
    if (this._reportService.ngPlan == 'weekly') {
      is_weekly = true;
    }
    this.isGenerateReportLoader = true;
    let params = {
      page: page,
      inventory_summary: true,
      inventory: this.inventory,
      keyword: this.keyword,
      store_list: this.selectedStores.pk_storeID,
      is_weekly,
      size: 20
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalData = res["totalRecords"];
      this.isGenerateReportLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isGenerateReportLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextReportData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.generateReport(this.page);
  };
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
