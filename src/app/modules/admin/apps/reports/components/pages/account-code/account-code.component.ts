import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';

@Component({
  selector: 'app-account-code',
  templateUrl: './account-code.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportAccountCodeComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active', 'ordered', 'video'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';
  supplierData: any;
  isLoadMore: boolean = false;
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