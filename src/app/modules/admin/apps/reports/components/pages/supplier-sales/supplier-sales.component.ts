import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

@Component({
  selector: 'app-supplier-sales',
  templateUrl: './supplier-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportsSupplierSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'times', 'core'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;
  fileDownloadLoader: boolean;
  // ReportDropdowns
  reportType = 0;
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