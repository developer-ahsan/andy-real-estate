import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';

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
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStores();
  };
  getStores() {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: '' });
      this.allStores = this.allStores.concat(res["data"]);
      this.selectedStores = this.allStores[0];
      this.searchStoresCtrl.setValue(this.selectedStores);
      this.generateReport(1);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
    let params;
    this.searchStoresCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          stores: true,
          keyword: res
        }
        return res !== null && res.length >= 2
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStores = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._reportService.getAPIData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStores = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: '' });
      this.allStores = this.allStores.concat(data["data"]);
    });
  }
  onSelectedStores(ev) {
    this.selectedStores = ev.option.value;
  }
  displayWithStores(value: any) {
    return value?.storeName;
  }
  generateReport(page) {
    if (page == 1) {
      this.page = 1;
      if (this.generateReportData) {
        this.paginator.pageIndex = 0;
      }
    }
    this.isGenerateReportLoader = true;
    let params = {
      page: page,
      inventory_summary: true,
      inventory: this.inventory,
      keyword: this.keyword,
      store_list: this.selectedStores.pk_storeID,
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
