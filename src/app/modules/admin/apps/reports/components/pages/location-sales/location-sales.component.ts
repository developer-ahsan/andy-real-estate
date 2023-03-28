import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-location-sales',
  templateUrl: './location-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportsLocationSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active', 'ordered', 'video'];
  totalUsers = 0;
  tempTotalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;
  blnActive = 3;
  keyword = '';
  blnVideo = 3;

  isSearchingLoader: boolean = false;

  isFileDownloadLoader: boolean = false;
  fileDownloadLoader: boolean = false;
  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;
  blnYTD = 0;
  blnIndividualOrders = 0;
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