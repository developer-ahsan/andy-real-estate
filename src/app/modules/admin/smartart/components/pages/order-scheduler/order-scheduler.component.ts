import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
@Component({
  selector: 'app-order-scheduler',
  templateUrl: './order-scheduler.component.html',
  styles: [".mat-paginator  {border-radius: 16px !important} .mat-drawer-container {border-radius: 16px !important} ::-webkit-scrollbar {height: 3px !important}"]
})
export class OrderSchedulerComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  mainScreen = 'Awaiting Artwork Approval';
  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['date', 'inhands', 'order', 'customer', 'product', 'status', 'age', 'action'];
  totalRecords = 0;
  tempRecords = 0;
  page = 1;


  // Search Stores
  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;
  // Search Designers
  allDesigners = [];
  searchDesignerCtrl = new FormControl();
  selectedDesigner: any;
  isSearchingDesigner = false;
  // Search Filters
  ngSearchStore = '';
  ngSearchDesigner = '';
  ngFilterField = '';
  isFilterLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _smartartService: SmartArtService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.searchableFields();
    this.getSmartArtList(1, 'get');
  };
  calledScreen(screen) {
    this.mainScreen = screen;
  }
  searchableFields() {
    this._smartartService.adminStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: null });
      this.allStores = this.allStores.concat(res['data']);
    });
    this._smartartService.smartArtUsers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allDesigners.push({ firstName: 'All', lastName: " Designers", pk_userID: null });
      this.allDesigners = this.allDesigners.concat(res['data']);
    });
    let params;
    this.searchStoreCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          stores: true,
          bln_active: 1,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStore = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._smartartService.getSmartArtData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStore = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores.push({ storeName: 'All Stores', pk_storeID: null });
      this.allStores = this.allStores.concat(data['data']);
    });
    let params1;
    this.searchDesignerCtrl.valueChanges.pipe(
      filter((res: any) => {
        params1 = {
          smart_art_users: true,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allDesigners = [];
        this.isSearchingDesigner = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._smartartService.getSmartArtData(params1)
        .pipe(
          finalize(() => {
            this.isSearchingDesigner = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allDesigners.push({ firstName: 'All', lastName: " Designers", pk_userID: null });
      this.allDesigners = this.allDesigners.concat(data['data']);
    });

  }
  onSelected(ev) {
    this.selectedStore = ev.option.value;
  }
  displayWith(value: any) {
    return value?.storeName;
  }
  onSelectedDesigner(ev) {
    this.selectedDesigner = ev.option.value;
  }
  displayWithDesigner(value: any) {
    let name = '';
    if (value) {
      name = value?.firstName + ' ' + value.lastName;
    }
    return name;
  }
  getSmartArtList(page, type) {
    let params = {
      smart_art_userID: 7,
      smartart_list: true,
      page: page,
      size: 20,
      store_id: this.ngSearchStore,
      designerID: this.ngSearchDesigner,
      filter_field: this.ngFilterField
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (this.isFilterLoader) {
        this.drawer.toggle();
      }
      this.dataSource = res["data"];
      this.totalRecords = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      this.isLoading = false;
      this.isFilterLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFilterLoader = false;
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSmartArtList(this.page, 'get');
  };
  onOrderStatusChange(ev) {
    this.isLoading = true;
    if (this.dataSource.length) {
      this.paginator.pageIndex = 0;
    }
    this.ngSearchStore = '';
    this.ngSearchDesigner = '';
    if (ev == 1) {
      this.ngFilterField = null;
    } else {
      this.ngFilterField = ev;
    }
    this.getSmartArtList(1, 'get');
  }
  filterSmartArtList() {
    this.isFilterLoader = true;
    if (this.dataSource.length) {
      this.paginator.pageIndex = 0;
    }
    if (this.selectedStore) {
      if (this.selectedStore.pk_storeID) {
        this.ngSearchStore = this.selectedStore.pk_storeID
      } else {
        this.ngSearchStore = null
      }
    }
    if (this.selectedDesigner) {
      if (this.selectedDesigner.pk_userID) {
        this.ngSearchDesigner = this.selectedDesigner.pk_userID
      } else {
        this.ngSearchDesigner = null
      }
    }
    this._changeDetectorRef.markForCheck();
    this.getSmartArtList(1, 'get');
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
