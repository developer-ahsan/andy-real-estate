import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-approval-contacts',
  templateUrl: './approval-contacts.component.html'
})
export class ApprovalContactsComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  flashMessage: 'success' | 'error' | null = null;
  approval_detail_text: string = "Define any additional artwork approval contacts in the fields below. Approval contacts defined here will run specific to this user, in additional to any approval contacts defined at the store level. These approval contacts below only apply if the store approval contacts are set to include the customer-level approval contacts."
  e_check: string = "Determines whether to include any additional emails defined below when proofs are sent to this contact."
  r_check: string = "Determines whether this approval contact as ability to designate royalities during approval."
  selectedStore: StoresList = null;
  stores: string[] = [
    'RaceWorldPromos.com',
    'RaceWorldPromos.com',
    'RaceWorldPromos.com'
  ];
  storesList: StoresList[] = [];
  storesListLength: number = 0;
  enableAddRequest = false;
  enableBackNavigation = false;
  enableForm = false;
  selectedCustomerForm: FormGroup;
  addApprovalLoader = false;

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCustomer();

    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Create the selected product form
    this.selectedCustomerForm = this._formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(emailregex)]],
      student_org_code: [''],
      student_org_name: [''],
      bln_emails: false,
      bln_royalties: false
    });
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        let params = {
          approval_contact: true,
          user_id: this.selectedCustomer.pk_userID,
          store_id: this.selectedCustomer.storeId
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(stores => {
          this.storesList = stores["data"];
          this.storesListLength = stores["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }
  storeSelection() {
    this.enableAddRequest = true;
  }

  approvalFormToggle() {
    this.enableForm = !this.enableForm;
    this.enableBackNavigation = !this.enableBackNavigation;
  }

  toggleBackNavigation() {
    this.enableForm = !this.enableForm;
    this.enableBackNavigation = !this.enableBackNavigation;
    this.enableAddRequest = false;
    this.selectedCustomerForm.reset();
    this.selectedStore = null;
  }

  /**
     * Update the selected product using the form mock-api
     */
  addApprovalContact(): void {
    const { storeID, storeUserID } = this.selectedStore;
    const customer = this.selectedCustomerForm.getRawValue();
    const { first_name, last_name, email, bln_emails, bln_royalties, student_org_code, student_org_name } = customer;

    if(first_name.trim() === '' || last_name.trim() === '' || email.trim() === '') {
      this._snackBar.open('Please fill the required fields', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
    });
      return;
    }

    const payload = {
      store_user_id: storeUserID,
      list_order: 10,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      bln_emails: bln_emails,
      bln_royalties: bln_royalties,
      store_id: storeID,
      student_org_code: student_org_code.trim(),
      student_org_name: student_org_name.trim(),
      approval_contact: true
    }
    this.addApprovalLoader = true;
    this._customerService.PostApiData(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.addApprovalLoader = false;
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
