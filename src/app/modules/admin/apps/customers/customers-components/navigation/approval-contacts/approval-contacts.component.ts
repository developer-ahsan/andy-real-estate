import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-approval-contacts',
  templateUrl: './approval-contacts.component.html'
})
export class ApprovalContactsComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  allStores = [];
  selectedStore: any;
  isGetContactsLoader: boolean = false;
  approvalContacts = [];
  addForm: any;
  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.addForm = {
      listOrder: 1,
      firstName: '',
      lastName: '',
      email: '',
      studentOrgCode: '',
      studentOrgName: '',
      blnEmails: false,
      blnRoyalties: false,
    }
    this.getStores();
    this.getCustomer();
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
      });
  }
  getStores() {
    this._commonService.storesData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.allStores.push({ storeName: 'Select a store', pk_storeID: 0 });
        const activeStores = res["data"].filter(element => element.blnActive);
        this.allStores.push(...activeStores);
        this.selectedStore = this.allStores[0];
      });
  }
  getApprovalContacts() {
    if (this.selectedStore.pk_storeID != 0) {
      this.addForm = {
        listOrder: 1,
        firstName: '',
        lastName: '',
        email: '',
        studentOrgCode: '',
        studentOrgName: '',
        blnEmails: false,
        blnRoyalties: false,
      }
      this.approvalContacts = [];
      this.isGetContactsLoader = true;
      let params = {
        approval_contact: true,
        user_id: this.selectedCustomer.pk_userID,
        store_id: this.selectedStore.pk_storeID
      }
      this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
        this.isGetContactsLoader = false;
        this._changeDetectorRef.markForCheck();
      })).subscribe(res => {
        if (res["data"][0]) {
          const contacts = res["data"][0].qryContacts.split(',,');
          contacts.forEach(contact => {
            const [pk_approvalContactID, listOrder, blnIncludeAdditionalEmails, firstName, lastName, email, studentOrgCode, studentOrgName, blnRoyalties] = contact.split('::');
            let blnEmails = false;
            let royalties = false;
            let code = studentOrgCode;
            let name = 'false';
            if (blnRoyalties == '1') {
              royalties = true;
            }
            if (blnIncludeAdditionalEmails == '1') {
              blnEmails = true;
            }
            if (studentOrgCode == 'N/A') {
              code = '';
            }
            if (studentOrgName == 'N/A') {
              name = '';
            }
            this.approvalContacts.push({ pk_approvalContactID, listOrder, blnIncludeAdditionalEmails: blnEmails, firstName, lastName, email, studentOrgCode: code, studentOrgName: name, blnRoyalties: royalties });
          });
        }
      });
    }
  }
  addNewContact() {
    const { listOrder, firstName, lastName, email, studentOrgCode, studentOrgName, blnEmails, blnRoyalties } = this.addForm;
    if (listOrder <= 0) {
      this._customerService.snackBar('List order should be greater than 0');
      return;
    }
    if (firstName.trim() == '' || lastName.trim() == '' || email.trim() == '') {
      this._customerService.snackBar('First Name, Last Name and Email is required.');
      return;
    }
    if (!this._commonService.isValidEmail(email)) {
      this._customerService.snackBar('Please enter a valid email address');
      return;
    }
    let payload = {
      list_order: listOrder,
      first_name: firstName,
      last_name: lastName,
      email,
      bln_emails: blnEmails,
      store_id: Number(this.selectedStore.pk_storeID),
      student_org_code: studentOrgCode,
      student_org_name: studentOrgName,
      bln_royalties: blnRoyalties,
      store_user_id: this.selectedCustomer.pk_userID,
      add_approval_contact: true
    }
    this.addForm.isAddLoader = true;
    this._changeDetectorRef.markForCheck();
    this._customerService.PostApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.addForm.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._customerService.snackBar(res["message"]);
        this.addForm = {
          listOrder: 1,
          firstName: '',
          lastName: '',
          email: '',
          studentOrgCode: '',
          studentOrgName: '',
          blnEmails: false,
          blnRoyalties: false
        }
        this.getApprovalContacts();
      }
    });
  }
  updateApprovalContact(contact) {
    const { pk_approvalContactID, listOrder, firstName, lastName, email, studentOrgCode, studentOrgName, blnIncludeAdditionalEmails, blnRoyalties } = contact;
    if (listOrder <= 0) {
      this._customerService.snackBar('List order should be greater than 0');
      return;
    }
    if (firstName.trim() == '' || lastName.trim() == '' || email.trim() == '') {
      this._customerService.snackBar('First Name, Last Name and Email is required.');
      return;
    }
    if (!this._commonService.isValidEmail(email)) {
      this._customerService.snackBar('Please enter a valid email address');
      return;
    }
    let payload = {
      list_order: Number(listOrder),
      first_name: firstName,
      last_name: lastName,
      email,
      bln_emails: blnIncludeAdditionalEmails,
      bln_royalties: blnRoyalties,
      store_id: this.selectedCustomer.pk_userID,
      student_org_code: studentOrgCode,
      student_org_name: studentOrgName,
      approvalContactID: Number(pk_approvalContactID),
      update_approval_contact: true
    }
    contact.isUpdateLoader = true;
    this._changeDetectorRef.markForCheck();
    this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      contact.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._customerService.snackBar(res["message"]);
      }
    });
  }
  removaApprovalContact(contact) {
    const { pk_approvalContactID, listOrder, firstName, lastName, email, studentOrgCode, studentOrgName, blnIncludeAdditionalEmails, blnRoyalties } = contact;
    this._commonService.showConfirmation('Are you sure you want to remove this art approval contact?', (confirmed) => {
      if (confirmed) {
        contact.isRemoveLoader = true;
        let payload = {
          approvalContactID: Number(pk_approvalContactID),
          remove_approval_contact: true
        }
        this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          contact.isRemoveLoader = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
          if (res["success"]) {
            this._customerService.snackBar(res["message"]);
            this.approvalContacts = this.approvalContacts.filter(item => item.pk_approvalContactID != contact.pk_approvalContactID);
          }
        }, err => {
          contact.isRemoveLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }



  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
