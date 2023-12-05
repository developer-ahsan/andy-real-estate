import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { FileManagerService } from '../../store-manager.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { updateFulfillmentOptions } from '../../stores.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-fulfill-options',
  templateUrl: './fulfill-options.component.html'
})
export class FulfillOptionsComponent implements OnInit, OnDestroy {

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isPageLoading: boolean = false;
  optionForm: FormGroup;
  isUpdateLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService
  ) { }

  ngOnInit() {
    this.optionForm = new FormGroup({
      billingCompanyName: new FormControl('', Validators.required),
      billingFirstName: new FormControl('', Validators.required),
      billingLastName: new FormControl('', Validators.required),
      billingAddress: new FormControl('', Validators.required),
      billingCity: new FormControl('', Validators.required),
      billingState: new FormControl('', Validators.required),
      billingZip: new FormControl('', Validators.required),
      billingPhone: new FormControl('', Validators.required),
      billingEmail: new FormControl('', [Validators.required, Validators.email]),
      blnEvent: new FormControl(true, Validators.required),
      blnBilling: new FormControl(true, Validators.required)
    })
    this.isPageLoading = true;
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.getOptionsData();
      });
  }
  getOptionsData() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      fulfillment_option: true
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.optionForm.patchValue(res["data"][0]);
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  updateFullfillmentOptions() {
    const { pk_storeID } = this.selectedStore;
    const { blnEvent, billingCompanyName, billingFirstName, billingLastName, billingAddress, blnBilling, billingCity, billingState, billingZip, billingPhone, billingEmail } = this.optionForm.getRawValue();
    let payload: updateFulfillmentOptions = {
      storeID: pk_storeID,
      blnEvent,
      billingCompanyName,
      billingFirstName,
      billingLastName,
      billingAddress,
      blnBilling,
      billingCity,
      billingState,
      billingZip,
      billingPhone,
      billingEmail,
      update_fulfillment_options: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    if (payload.billingCompanyName == '' || payload.billingFirstName == '' || payload.billingLastName == '' || payload.billingAddress == '' || payload.billingCity == '' || payload.billingState == '' || payload.billingZip == '' || payload.billingPhone == '' || payload.billingEmail == '') {
      this._storeManagerService.snackBar('Please fill out the required fields');
      return;
    }
    this.isUpdateLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
    })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
