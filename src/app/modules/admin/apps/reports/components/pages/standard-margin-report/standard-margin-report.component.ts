import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { ApplyBlanketFOBlocation, applyCompanyWideCoop, updateCompanySettings } from '../../reports.types';

@Component({
  selector: 'app-standard-margin-report',
  templateUrl: './standard-margin-report.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ReportStandardMarginComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchCoopCtrl = new FormControl();
  selectedCoop: any;
  isSearchingCoop = false;

  allCoops = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: ReportsService
  ) { }

  ngOnInit(): void {

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
