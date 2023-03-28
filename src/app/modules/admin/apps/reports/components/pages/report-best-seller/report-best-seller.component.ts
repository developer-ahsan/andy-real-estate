import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';

@Component({
  selector: 'app-report-best-seller',
  templateUrl: './report-best-seller.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportBestSellerComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  isModal: boolean = false;
  // ReportDropdowns
  companyID = 0;
  productType = 0;
  keyword = '';
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