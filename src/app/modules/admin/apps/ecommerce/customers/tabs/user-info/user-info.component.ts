import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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

  selectedCustomer: any;
  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.selectedCustomerForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      blnActive: new FormControl(true),
      new_email: new FormControl(''),
      old_email: new FormControl(''),
      blnAdmin: new FormControl(false),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      website: new FormControl(''),
      fax: new FormControl(''),
      title: new FormControl(''),
      department: new FormControl(''),
      companyName: new FormControl(''),
      accountChargeCode: new FormControl(''),
      shippingAddress1: new FormControl(''),
      shippingAddress2: new FormControl(''),
      shippingCity: new FormControl(''),
      shippingCompanyName: new FormControl(''),
      shippingDayPhone: new FormControl(''),
      shippingEmail: new FormControl(''),
      shippingFirstName: new FormControl(''),
      shippingLastName: new FormControl(''),
      shippingState: new FormControl(''),
      shippingStudentOrgCode: new FormControl(''),
      shippingStudentOrgName: new FormControl(''),
      shippingZipCode: new FormControl(''),
      shippingZipCodeExt: new FormControl(''),
      billingStudentOrgName: new FormControl(''),
      billingStudentOrgCode: new FormControl(''),
    });
    console.log('here')
    // Create the selected product form
    // this.selectedCustomerForm = this._formBuilder.group({
    //   id: [''],
    //   firstName: [''],
    //   lastName: [''],
    //   email: [''],
    //   companyName: [''],
    //   storeName: [''],
    //   title: [''],
    //   date: [''],
    //   ipaddress: [''],
    //   fax: [''],
    //   dayPhone: [''],
    //   zipCode: [''],
    //   city: [''],
    //   blnActive: [''],
    //   website: [''],
    //   department: ['']
    // });

    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.selectedCustomerForm.patchValue(response);
        this.selectedCustomerForm.patchValue({
          new_email: response.email
        })
        console.log(this.selectedCustomer)

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
    const { userName, password, blnActive, new_email, old_email, blnAdmin, email, firstName, lastName, website, fax, title, department, companyName, accountChargeCode, shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingCompanyName,
      shippingDayPhone,
      shippingEmail,
      shippingFirstName,
      shippingLastName,
      shippingState,
      shippingStudentOrgCode,
      shippingStudentOrgName,
      shippingZipCode,
      shippingZipCodeExt,
      billingStudentOrgName,
      billingStudentOrgCode, } = this.selectedCustomerForm.getRawValue();

    const payload = {
      update_user: true,
      userID: parseInt(pk_userID),
      user_name: userName,
      password: password,
      bln_active: blnActive,
      new_email: new_email,
      old_email: email,
      first_name: firstName,
      last_name: lastName,
      company_name: companyName,
      department: department,
      website: website,
      title: title,
      fax: fax,
      account_charge_code: accountChargeCode,
      billingOrgName: billingStudentOrgName,
      billingOrgCode: billingStudentOrgCode,
      shippingFirstName: shippingFirstName,
      shippingLastName: shippingLastName,
      shippingCompany: shippingCompanyName,
      shippingEmail: shippingEmail,
      shipping_address1: shippingAddress1,
      shipping_address2: shippingAddress2,
      shippingOrgName: shippingStudentOrgName,
      shippingOrgCode: shippingStudentOrgCode,
      shippingCity: shippingCity,
      shippingState: shippingState,
      shippingZip: shippingZipCode,
      shippingZipExt: shippingZipCodeExt,
      shippingPhone: shippingDayPhone
    };

    this.updateUserLoader = true;
    this._customerService.upgradeUser(payload)
      .subscribe((response: any) => {
        this.updateUserLoader = false;
        this._customerService.snackBar(response["message"]);
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.updateUserLoader = false;
        this._changeDetectorRef.markForCheck();
        this._changeDetectorRef.markForCheck();
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
