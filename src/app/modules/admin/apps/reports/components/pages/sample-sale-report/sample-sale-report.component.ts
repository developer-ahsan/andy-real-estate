import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddCoops, AddFOBLocation, DeleteCoops, RemoveFOBLocation, UpdateCoops } from '../../reports.types';
import moment from 'moment';

@Component({
  selector: 'app-sample-sale-report',
  templateUrl: './sample-sale-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportSampleSaleComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'expired', 'action'];
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
  coopData: any;
  isUpdate: boolean = false;

  // Add FOB Location
  addCoopForm: FormGroup;
  isAddLoader: boolean = false;

  // Search By Keyword
  isSearching: boolean = false;
  keyword = '';

  minDate: any;
  updateDate: any;
  isUpdateLoader: boolean = false;
  updateData = {
    coOp_id: '',
    coopName: '',
    coopExpDay: null,
    pricing: '',
    ltm: '',
    setups: '',
    productionTime: '',
    update_coop: true
  }
  // ReportDropdowns
  blnShowCancelled = 0;
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