import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShippingNotification, updateProcurementSettings } from '../../stores.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-store-procurement-settings',
  templateUrl: './store-procurement-settings.component.html'
})
export class StoreProcurementSettingsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  shippingNotificationForm: FormGroup;

  isStoreFetch: boolean = true;
  updateLoader = false;
  flashMessage: 'success' | 'error' | null = null;

  procurementSettings: any;
  constructor(
    public _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.shippingNotificationForm = this._formBuilder.group({
          blnShippingNotification: ['']
        });
        // Get the items
        this.getProcurementSettings();
      });
  }
  getProcurementSettings() {
    let params = {
      procurement_settings: true,
      store_id: this.selectedStore.pk_storeID
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.procurementSettings = res["data"][0];
    });
  }
  /**
* Show flash message
*/
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

  // Public methods

  saveChanges(): void {
    const { pk_storeID, storeName } = this.selectedStore;
    const formValues = this.shippingNotificationForm.getRawValue();
    const {
      fromDomain,
      fromIdentity,
      toDomain,
      toIdentity,
      senderDomain,
      senderIdentity,
      sharedSecret,
      DUNSnumber,
      defaultCompanyName,
      defaultAddress1,
      defaultAddress2,
      defaultCity,
      defaultState,
      defaultZipCode,
      defaultDayPhone,
      blnShippingLineItems,
      blnEditInspect,
      blnAlertProgramManagerOnPunchout,
      fk_procurementID } = this.procurementSettings;
    let payload: updateProcurementSettings = {
      fromDomain,
      fromIdentity,
      toDomain,
      toIdentity,
      senderDomain,
      senderIdentity,
      sharedSecret,
      DUNSnumber,
      defaultCompanyName,
      defaultAddress1,
      defaultAddress2,
      defaultCity,
      defaultState,
      defaultZipCode,
      defaultDayPhone,
      blnShippingLineItems,
      blnEditInspect,
      blnAlertProgramManagerOnPunchout,
      procurementID: fk_procurementID,
      storeID: this.selectedStore.pk_storeID,
      update_procurement_settings: true
    };
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    payload = this._commonService.replaceNullSpaces(payload);
    if (payload.fromDomain == '' || payload.fromIdentity == '' || payload.toDomain == '' || payload.toIdentity == '' || payload.senderIdentity == '' || payload.sharedSecret == '' || payload.defaultCompanyName == '' || payload.defaultAddress1 == '' || payload.defaultCity == '' || payload.defaultState == '' || !payload.defaultZipCode || payload.defaultDayPhone == '') {
      this._storeManagerService.snackBar('Please fill out the required fields');
      return;
    }
    this.updateLoader = true;
    this._storeManagerService.putStoresData(payload)
      .subscribe((response) => {
        this._storeManagerService.snackBar(response["message"]);
        this.updateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.updateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

}
