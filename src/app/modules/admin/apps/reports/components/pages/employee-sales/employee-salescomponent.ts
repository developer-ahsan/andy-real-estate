import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { updateCompanySettings } from '../../reports.types';

@Component({
  selector: 'app-employee-sales',
  templateUrl: './employee-sales.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportsEmployeeSalesComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;
  // ReportDropdowns
  blnIndividualOrders = 0;
  paymentStatus = 1;
  ngEmployee = 0;
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