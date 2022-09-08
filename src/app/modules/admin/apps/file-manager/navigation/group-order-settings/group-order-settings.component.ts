import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-group-order-settings',
  templateUrl: './group-order-settings.component.html'
})
export class GroupOrderSettingsComponent implements OnInit, OnDestroy {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  selected = 'YES';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isStoreFetch: boolean = true;
  groupOrdersSettingsForm: FormGroup;

  isGroupOrderUpdate: boolean = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _storesManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.groupOrdersSettingsForm = this._formBuilder.group({
      blnGroupOrderActive: [''],
      blnChooseFromExistingCustomers: ['']
    });

    const { pk_storeID } = this.selectedStore;

    // Get the items
    this._storesManagerService.getStoreSetting(pk_storeID)
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

    this.isLoadingChange.emit(false);
  };

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

    const payload = {
      group_buy: true,
      store_id: pk_storeID,
      bln_groud_order_active: formValues.blnGroupOrderActive,
      bln_choose_existing_customers: formValues.blnChooseFromExistingCustomers
    };

    this.isGroupOrderUpdate = true;
    this._storesManagerService.updateGroupOrderSettings(payload)
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
