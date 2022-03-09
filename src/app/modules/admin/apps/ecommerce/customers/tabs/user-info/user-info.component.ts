import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html'
})
export class UserInfoComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

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

    const { pk_userID } = this.currentSelectedCustomer;
    this._customerService.getCustomerAddresses(pk_userID)
      .subscribe((addresses) => {
        this.isLoadingChange.emit(false);
      });

    // Get the customer by id
    this._customerService.getSingleCustomerDetails(pk_userID)
      .subscribe((customer) => {
        console.log("customer", customer)

        // Fill the form
        this.selectedCustomerForm.patchValue(customer);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
     * Update the selected product using the form mock-api
     */
  updateCustomerProduct(): void {
    const { pk_userID, blnActive } = this.currentSelectedCustomer;

    // Get the product object
    const customer = this.selectedCustomerForm.getRawValue();
    const payload = {
      user_role: "admin",
      email: customer.email,
      user_name: `${customer.firstName} ${customer.lastName}`,
      first_name: customer.firstName,
      last_name: customer.lastName,
      user_id: parseInt(pk_userID),
      bln_active: blnActive,
      user: true
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
