import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ReportsService } from '../../reports.service';
import { AddCompany, UpdateCompany, UpdateWebsiteLoginInfo } from '../../reports.types';
@Component({
  selector: 'app-store-sales',
  templateUrl: './store-sales.component.html',
  styles: ["::ng-deep {.ql-container {height: auto}} .mat-paginator {border-radius: 16px !important}"]
})
export class ReportsStoreSalesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  allStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  updateCompnayForm: FormGroup;
  isUpdateLoader: boolean = false;

  supplierData: any;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;

  additionalOrderEmails = [];

  websiteData: any = { userName: '', password: '' };
  isWebsiteDataLoad: boolean = false;
  isUpdateWebsiteLoader: boolean = false;

  // ReportDropdowns
  reportType = 0;
  blnShowCancelled = 0;
  paymentStatus = 1;
  blnYTD = 0;
  blnIndividualOrders = 0;
  state = '';
  promocode = '';
  blnCost = 0;
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
