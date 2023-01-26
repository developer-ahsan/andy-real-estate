import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
@Component({
  selector: 'app-search-history',
  templateUrl: './search-history.component.html',
  styles: ['mat-form-field {width: 100%}'],
  providers: [
    { provide: MatFormFieldControl, useExisting: SearchHistoryComponent }
  ]
})
export class SearchHistoryComponent implements OnInit, OnDestroy {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['searchTerm', 'frequency', 'results', 'daysAgo'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  keywordSearch: string = "";
  isKeywordSearch: boolean = false;

  // Advanced Search
  isAdvancedSearch: boolean = true;
  filterForm: FormGroup;
  filterSearch: boolean = false;
  firstDataTemp = {
    data: [],
    totalRecords: 0
  };
  isFilterLoader: boolean = false;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      check: new FormControl('all'),
      start_date: new FormControl(null),
      end_date: new FormControl(null),
    })
    this.dataSourceLoading = true;
    this.getFirstCall(1);
    this.isLoadingChange.emit(false);
  };
  getSearchHistory() {
    let params = {
      search_history: true,
      store_id: this.selectedStore.pk_storeID
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;
        this.dataSourceTotalRecord = response["totalRecords"];

        this._changeDetectorRef.markForCheck();
      })
  }

  getFirstCall(page) {
    // this.dataSourceLoading = true;
    const { pk_storeID } = this.selectedStore;
    let params = {
      search_history: true,
      store_id: this.selectedStore.pk_storeID,
      page: page,
      size: 20
    }
    // Get the supplier products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (page == 1) {
          this.firstDataTemp.data = response["data"];
          this.firstDataTemp.totalRecords = response["totalRecords"];
        }
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        this.getFirstCall(1);
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    if (this.filterSearch) {
      this.filterSearchHistory(this.page);
    } else {
      this.getFirstCall(this.page);
    }
  };

  resetSearch(): void {
    this.isAdvancedSearch = false;
    this.filterSearch = false;
    this.page = 1;
    this.dataSource = this.firstDataTemp.data;
    this.dataSourceTotalRecord = this.firstDataTemp.totalRecords;
    this.filterForm.reset();
    this.filterForm.patchValue({
      keyword: ''
    })
    // Mark for check
    this._changeDetectorRef.markForCheck();
  };
  filterSearchHistory(page) {
    this.isFilterLoader = true;
    const { pk_storeID } = this.selectedStore;
    const { keyword, start_date, end_date } = this.filterForm.getRawValue();
    let params: any = {
      search_history: true,
      store_id: this.selectedStore.pk_storeID,
      page: page,
      size: 20
    }
    if (keyword != '' || keyword != null) {
      params.keyword = keyword;
    }
    if (start_date) {
      params.start_date = moment(this.filterForm.get('start_date').value).format('MM-DD-YYYY');
      params.end_date = moment(this.filterForm.get('end_date').value).format('MM-DD-YYYY');
    }

    // Get the supplier products
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.isFilterLoader = false;
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Recall on error
        this.getFirstCall(1);
        this.dataSourceLoading = false;
        this.isFilterLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  advancedSearchToggle() {
    this.isAdvancedSearch = !this.isAdvancedSearch;
  }
  getDiferenceInDays(theDate: any) {
    let firstDate = new Date(moment(theDate).format('YYYY-MM-DD')); //new Date('2019-11-12');
    let secondDate = new Date('Tue Nov 26 2019 17:28:33');//new Date('2019-11-20');

    let milliSFirst = firstDate.getTime();
    let milliSSecond = secondDate.getTime();
    return Number((milliSSecond - milliSFirst) / (1000 * 3600 * 24)).toFixed(0)
  }
  convertDate(date) {
    return moment(date).format('YYYY-MM-DD')
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}

