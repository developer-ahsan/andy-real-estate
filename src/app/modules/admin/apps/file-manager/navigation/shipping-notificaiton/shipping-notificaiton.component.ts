import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShippingNotification } from '../../stores.types';

@Component({
  selector: 'app-shipping-notificaiton',
  templateUrl: './shipping-notificaiton.component.html'
})
export class ShippingNotificaitonComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  shippingNotificationForm: FormGroup;

  isStoreFetch: boolean = true;
  updateLoader = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
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
        this.shippingNotificationForm.patchValue(this.selectedStore);
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
    const payload: ShippingNotification = {
      bln_notification: formValues.blnShippingNotification,
      store_id: pk_storeID,
      store_name: storeName,
      shipping_notification: true
    };

    this.updateLoader = true;
    this._storeManagerService.putStoresData(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
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
