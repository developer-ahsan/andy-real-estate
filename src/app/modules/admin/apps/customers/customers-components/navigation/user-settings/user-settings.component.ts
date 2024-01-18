import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { CreditTerm, UserCreditTerms } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { updateStoreUserSettings } from '../../customers.types';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html'
})
export class UserSettingsComponent implements OnInit {
  @Input() updateLoader: boolean;

  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnQuoteReminders: boolean = false;
  blnSurveyEmails: boolean = false;
  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this._changeDetectorRef.markForCheck();
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.blnQuoteReminders = this.selectedCustomer.blnQuoteReminders;
        this.blnSurveyEmails = this.selectedCustomer.blnSurveyEmails;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  updateUserSettings(): void {
    this.updateLoader = true;
    const { pk_userID } = this.selectedCustomer;
    const payload: updateStoreUserSettings = {
      blnQuoteReminders: this.blnQuoteReminders,
      blnSurveyEmails: this.blnSurveyEmails,
      userID: pk_userID,
      updateStoreUserSettings: true
    }
    this._customerService.PutApiData(payload)
      .subscribe((response: any) => {
        if (response["success"]) {
          this._customerService.snackBar(response["message"]);
        }
        this.updateLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.updateLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

}
