import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddFOBLocation, RemoveFOBLocation } from '../../reports.types';

@Component({
  selector: 'app-item-report',
  templateUrl: './item-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportItemsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['location', 'address', 'city', 'state', 'zip', 'action'];
  totalUsers = 0;
  tempTotalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  mainScreen = 'Current'

  // States
  allStates = [];
  tempStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  // Location Data for Update
  locationData: any;
  isUpdate: boolean = false;

  // Add FOB Location
  addLocationForm: FormGroup;
  isAddLoader: boolean = false;

  // Search By Keyword
  isSearching: boolean = false;
  keyword = '';
  // ReportDropdowns
  rangeBasedOn = 'order';
  blnShowCancelled = 0;
  paymentStatus = 1;
  ngStore = 637;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: ReportsService
  ) { }

  ngOnInit(): void {
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