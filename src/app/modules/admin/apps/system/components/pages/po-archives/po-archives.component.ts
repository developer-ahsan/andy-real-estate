import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../system.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-po-archives',
  templateUrl: './po-archives.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class POArchivesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'store', 'date', 'supplier', 'customer', 'customer_company', 'status'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Imprint Methods';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddMethodLoader: boolean = false;

  // Update Color
  isUpdateMethodLoader: boolean = false;
  isUpdateMethod: boolean = false;
  updateMethodData: any;
  ngRGBUpdate = '';
  stores: any;
  suppliers: any;


  allSuppliers = [];
  searchSupplierCtrl = new FormControl();
  selectedSupplier: any;
  isSearchingSupplier = false;

  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this._commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.allStores = [
          ...res["data"].filter(element => element.blnActive)
        ];
      });
    this._commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.allSuppliers = [
          ...res["data"].filter(element => element.blnActiveVendor)
        ];
      });
    this.isLoading = false;
    this.isLoadingChange.emit(false);
    this._changeDetectorRef.markForCheck();
  };
  // Stores
  onSelectedStore(ev) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, 500);
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
