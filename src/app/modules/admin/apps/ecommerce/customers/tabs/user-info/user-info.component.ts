import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { takeUntil } from 'rxjs/operators';
import { merge, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html'
})
export class UserInfoComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedCustomerForm: FormGroup;
  updateUserLoader = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {

    // Create the selected product form
    this.selectedCustomerForm = this._formBuilder.group({
      id: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      companyName: [''],
      storeName: [''],
      title: [''],
      date: [''],
      ipaddress: [''],
      fax: [''],
      dayPhone: [''],
      zipCode: [''],
      city: [''],
      blnActive: [''],
      website: [''],
      department: ['']
    });

    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomerForm.patchValue(response);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
     * Update the selected product using the form mock-api
     */
  updateCustomerProduct(): void {
    const { pk_userID } = this.currentSelectedCustomer;

    // Get the product object
    const customerForm = this.selectedCustomerForm.getRawValue();

    console.log("this.currentSelectedCustomer", this.currentSelectedCustomer);
    console.log("this.selectedCustomerForm", customerForm);

    const payload = {
      user: true,
      user_role: "admin",
      email: customerForm.email,
      user_name: `${customerForm.firstName} ${customerForm.lastName}`,
      first_name: customerForm.firstName,
      last_name: customerForm.lastName,
      user_id: parseInt(pk_userID),
      password: "password",
      user_type: "admin",
    };

    console.log("payload", payload);
    this.updateUserLoader = true;
    this._customerService.upgradeUser(payload)
      .subscribe((response: any) => {
        console.log("response", response);
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.updateUserLoader = false;
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

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

}
