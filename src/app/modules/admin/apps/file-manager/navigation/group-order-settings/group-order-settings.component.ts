import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdateGroupOrderSettings } from '../../stores.types';

@Component({
  selector: 'app-group-order-settings',
  templateUrl: './group-order-settings.component.html'
})
export class GroupOrderSettingsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  selected = 'YES';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isStoreFetch: boolean = true;
  groupOrdersSettingsForm: FormGroup;

  isGroupOrderUpdate: boolean = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.groupOrdersSettingsForm = this._formBuilder.group({
      blnGroupOrderActive: [''],
      blnChooseFromExistingCustomers: [''],
      blnInitiatorPays: ['']
    });
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this._storeManagerService.settings$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((response: any) => {
            let storeSetting = response["data"][0];
            this.selectedStore["reportColor"] = `#${this.selectedStore["reportColor"]}`;
            storeSetting["cashbackPercent"] = storeSetting["cashbackPercent"] * 100;

            this.groupOrdersSettingsForm.patchValue(this.selectedStore);
            this.groupOrdersSettingsForm.patchValue(storeSetting);

            this.isStoreFetch = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.isStoreFetch = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
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
    const { pk_storeID } = this.selectedStore;
    const formValues = this.groupOrdersSettingsForm.getRawValue();

    // blnInitiatorPays
    const payload: UpdateGroupOrderSettings = {
      bln_choose_existing_customers: formValues.blnChooseFromExistingCustomers,
      bln_groud_order_active: formValues.blnGroupOrderActive,
      store_id: pk_storeID,
      update_group_order_settings: true
    };

    this.isGroupOrderUpdate = true;
    this._storeManagerService.putStoresData(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.isGroupOrderUpdate = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isGroupOrderUpdate = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
}
