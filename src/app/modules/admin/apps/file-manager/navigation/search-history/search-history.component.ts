import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-search-history',
  templateUrl: './search-history.component.html',
  styles: ['mat-form-field {width: 100%}'],
  providers: [
    { provide: MatFormFieldControl, useExisting: SearchHistoryComponent }
  ]
})
export class SearchHistoryComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  selectedStore: any;
  isLoading: boolean;
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
  showReset: boolean = false;
  isResetLoader: boolean = false;

  // Advanced Search
  isAdvancedSearch: boolean = true;
  filterForm: FormGroup;
  filterSearch: boolean = false;
  firstDataTemp = {
    data: [],
    totalRecords: 0
  };
  isFilterLoader: boolean = false;

  sortBy = 'counter';
  sortOrderd = 'ASC';


  selectedHistory: string = 'all';
  selectedHistoryKey: string;
  statuses: any = [
    {
      value: 'All time',
      key: 'all'
    },
    {
      value: 'This week',
      key: 'thisWeek'
    },
    {
      value: 'This month',
      key: 'thisMonth'
    },
    {
      value: 'This year',
      key: 'thisYear'
    },
  ];


  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.dataSourceLoading = true;
        this.filterForm = new FormGroup({
          keyword: new FormControl(''),
          check: new FormControl('all'),
          start_date: new FormControl(null),
          end_date: new FormControl(null),
        })
        this.dataSourceLoading = true;
        this.getFirstCall(1);
      });
  }
  getSearchHistory() {
    let params = {
      search_history: true,
      store_id: this.selectedStore.pk_storeID
    }
    this._storeManagerService.getStoresData(params)
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
    this.isResetLoader = true;
    const { pk_storeID } = this.selectedStore;
    let params = {
      search_history: true,
      store_id: this.selectedStore.pk_storeID,
      page: page,
      sort_by: this.sortBy,
      sort_order: this.sortOrderd,
      size: 20
    }
    // Get the supplier products
    this._storeManagerService.getStoresData(params)
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
        this.isResetLoader = false;
        this.showReset = false;
        this.filterForm.get('keyword').patchValue('');

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isResetLoader = false;

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
  sortData(ev) {
    if (ev.active == 'frequency') {
      this.sortBy = 'counter';
      this.sortOrderd = ev.direction;
    } else if (ev.active == 'results') {
      this.sortBy = 'resultSum';
      this.sortOrderd = ev.direction;
    } else if (ev.active == 'daysAgo') {
      this.sortBy = 'daysAgo';
      this.sortOrderd = ev.direction;
    }
    this.filterSearchHistory(1);
  }
  resetSearch(): void {
    this.isAdvancedSearch = false;
    this.filterSearch = false;
    this.page = 1;
    this.paginator.pageIndex = 0;
    this.dataSource = this.firstDataTemp.data;
    this.dataSourceTotalRecord = this.firstDataTemp.totalRecords;
    this.filterForm.reset();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      check: new FormControl('all'),
      start_date: new FormControl(null),
      end_date: new FormControl(null),
    })
    // Mark for check
    this._changeDetectorRef.markForCheck();
  };
  filterSearchHistory(page) {
    this.showReset = true;
    if (page == 1 && this.dataSourceTotalRecord > 0) {
      this.page = 1;
      this.paginator.pageIndex = 0;
    }
    this.isFilterLoader = true;
    const { pk_storeID } = this.selectedStore;
    const { keyword, start_date, end_date, check } = this.filterForm.getRawValue();
    let params: any = {
      search_history: true,
      store_id: this.selectedStore.pk_storeID,
      page: page,
      sort_by: this.sortBy,
      sort_order: this.sortOrderd,
      size: 20
    }
    let startDate = start_date;
    let endDate = end_date;

    if (!start_date) {
      if (check == 'week') {
        startDate = moment().startOf('isoWeek').format('yyyy-MM-DD');
        endDate = moment().endOf('isoWeek').format('yyyy-MM-DD');
      } else if (check == 'month') {
        startDate = moment().startOf('month').format('yyyy-MM-DD');
        endDate = moment().endOf('month').format('yyyy-MM-DD');
      } else if (check == 'year') {
        startDate = moment().startOf('year').format('yyyy-MM-DD');
        endDate = moment().endOf('year').format('yyyy-MM-DD');
      }
    }

    if (keyword != '' || keyword != null) {
      params.keyword = keyword;
    }
    if (startDate || endDate) {
      params.start_date = moment(startDate).format('MM-DD-YYYY');
      params.end_date = moment(endDate).format('MM-DD-YYYY');
    }

    // Get the supplier products
    this._storeManagerService.getStoresData(params)
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
    let secondDate = new Date();//new Date('2019-11-20');

    let milliSFirst = firstDate.getTime();
    let milliSSecond = secondDate.getTime();
    return Number((milliSSecond - milliSFirst) / (1000 * 3600 * 24)).toFixed(0)
  }
  convertDate(date) {
    return moment(date).format('YYYY-MM-DD')
  }

  async getData() {
    this.filterForm.reset();
    this.filterForm = new FormGroup({
      keyword: new FormControl(''),
      check: new FormControl('all'),
      start_date: new FormControl(null),
      end_date: new FormControl(null),
    })
    this.getFirstCall(this.page);

  }

  // setParams(value: any, key: string) {
  //   this.params = {
  //     ...this.params,
  //     [key]: value
  //   };
  //   this.getData();
  // }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}

