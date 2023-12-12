import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { merge, Observable, Subject } from 'rxjs';
import { CustomersService } from '../../orders.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html'
})
export class UserInfoComponent implements OnInit {
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedCustomerForm: FormGroup;
  updateUserLoader = false;
  flashMessage: 'success' | 'error' | null = null;

  selectedCustomer: any;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emails = [];

  editorConfig = {
    toolbar: [
      { name: 'clipboard', items: ['Undo', 'Redo'] },
      { name: 'styles', items: ['Format'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
      { name: 'align', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'insert', items: ['Table'] },
      { name: 'tools', items: ['Maximize'] },
    ],
  };

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.selectedCustomerForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      GovMVMTContractNumber: new FormControl(''),
      blnActive: new FormControl(true),
      new_email: new FormControl('', [Validators.email, Validators.required]),
      old_email: new FormControl(''),
      blnAdmin: new FormControl(false),
      disabledReason: new FormControl(''),
      email: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      website: new FormControl(''),
      fax: new FormControl(''),
      title: new FormControl(''),
      department: new FormControl(''),
      companyName: new FormControl('', Validators.required),
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
      designerNotes: new FormControl(''),
      rutgersStudentType: new FormControl(''),
      rutgersWorkflowOverride: new FormControl('')
    });


    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.selectedCustomerForm.patchValue(response);
        this.selectedCustomerForm.patchValue({
          new_email: response.email
        });
        if (!this.selectedCustomer.rutgersWorkflowOverride) {
          this.selectedCustomerForm.patchValue({
            rutgersWorkflowOverride: 0
          });
        }
        if (this.selectedCustomer.additionalEmails) {
          this.emails = this.selectedCustomer.additionalEmails.split(',');
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
     * Update the selected product using the form mock-api
     */
  updateCustomerProduct(): void {
    const { pk_userID } = this.selectedCustomer;

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
      GovMVMTContractNumber,
      billingStudentOrgCode, designerNotes, rutgersStudentType, rutgersWorkflowOverride, disabledReason } = this.selectedCustomerForm.getRawValue();
    let rutgersWorkflowOverrides = rutgersWorkflowOverride;
    if (rutgersWorkflowOverride == 0) {
      rutgersWorkflowOverrides = null;
    }
    let payload = {
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
      shippingPhone: shippingDayPhone,
      designerNotes: designerNotes,
      GovMVMTContractNumber,
      rutgersStudentType, rutgersWorkflowOverride: rutgersWorkflowOverrides,
      bln_admin: blnAdmin,
      disabledReason,
      additionalEmails: this.emails.toString()
    };
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.updateUserLoader = true;
    this._customerService.PutApiData(payload)
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
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.emails.push(value);
    }
    event.chipInput!.clear();
  }

  remove(email): void {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
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
