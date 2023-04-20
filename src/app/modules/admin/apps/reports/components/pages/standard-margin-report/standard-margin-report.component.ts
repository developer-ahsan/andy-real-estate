import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ApplyBlanketFOBlocation, applyCompanyWideCoop, updateCompanySettings } from '../../reports.types';

@Component({
  selector: 'app-standard-margin-report',
  templateUrl: './standard-margin-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportStandardMarginComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('paginator') paginator: MatPaginator;

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchCoopCtrl = new FormControl();
  selectedCoop: any;
  isSearchingCoop = false;

  allCoops = [];
  dataSource = [];
  displayedColumns: string[] = ['store', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'];
  total = 0;
  page = 1;

  isSearching: boolean = false;
  keyword = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _reportService: ReportsService
  ) { }

  ngOnInit(): void {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.total = res["totalRecords"];
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getStores(this.page);
  };
  getStores(page) {
    if (page == 1) {
      this.page = 1;
      this.paginator.pageIndex = 0;
    }
    if (this.keyword != '') {
      this.isSearching = true;
      this._changeDetectorRef.markForCheck();
    }
    let params = {
      page: page,
      keyword: this.keyword,
      size: 20,
      stores: true
    }
    this._reportService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isSearching = false;
      this._changeDetectorRef.markForCheck();
      this.dataSource = res["data"];
      this.total = res["totalRecords"];
    }, err => {
      this.isSearching = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  resetSearch() {
    this._reportService.Stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.page = 1;
      this.keyword = '';
      this.paginator.pageIndex = 0;
      this.dataSource = res["data"];
      this.total = res["totalRecords"]
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
