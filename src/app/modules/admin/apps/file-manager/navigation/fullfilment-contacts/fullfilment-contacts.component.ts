import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-fullfilment-contacts',
  templateUrl: './fullfilment-contacts.component.html',
})
export class FullfilmentContactsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  locationsData: any;
  isPageLoading: boolean = false;
  isContactListLoading: boolean = false;

  // Table
  displayedColumns: string[] = ['Primary', 'User', 'Location', 'Revised', 'Action'];
  dataSource: any = [];
  usersData: any;
  contactListData: any;

  contactForm: FormGroup;
  mainScreen: string = "Fulfillment Contacts";
  screens = [
    "Fulfillment Contacts",
    "Add New Contact"
  ];
  addContactForm: FormGroup;
  isAddLoader: boolean = false;
  isAddMsg: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.isPageLoading = true;
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.getLocations();
        this.getUsers();
        this.getContactList('get');
        this.initialize();
      });
  }
  initialize() {
    this.dataSource = [];
    this.contactForm = this.fb.group({
      contacts: new FormArray([])
    });
    this.addContactForm = this.fb.group({
      fk_userID: new FormControl('', Validators.required),
      fk_attributeID: new FormControl(0),
      blnPrimary: new FormControl(false),
      blnRevisedInvoices: new FormControl(false),
      add_fulfillment_contact: new FormControl(true),
    })
  }
  get contactListArray(): FormArray {
    return this.contactForm.get('contacts') as FormArray;
  }
  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };
  getLocations() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      contact: true,
      locations: true
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.locationsData = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  getUsers() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      contact: true,
      users: true
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        this.usersData = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  getContactList(check) {
    this.initialize();
    this.isContactListLoading = true;
    let params = {
      store_id: this.selectedStore.pk_storeID,
      fulfillment_contact: true
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        res["data"].forEach(element => {
          if (element.fk_attributeID == null) {
            element.fk_attributeID = 0;
          }
          this.dataSource.push(element)
        });
        // this.dataSource = res["data"];

        if (check == 'add') {
          this.isAddLoader = false;
          this.mainScreen = 'Fulfillment Contacts';
          this._storeManagerService.snackBar('Fullfillment contact added successfully');
        }
        this.isContactListLoading = false;

        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isContactListLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  addContactList() {
    this.isAddLoader = true;
    const { pk_storeID } = this.selectedStore;
    const { fk_userID, fk_attributeID, blnPrimary, blnRevisedInvoices, add_fulfillment_contact } = this.addContactForm.getRawValue();
    let attribute = fk_attributeID;
    if (fk_attributeID == 0) {
      attribute = null
    }
    let payload = {
      fk_storeID: pk_storeID,
      fk_userID,
      fk_attributeID: attribute,
      blnPrimary, blnRevisedInvoices, add_fulfillment_contact
    }
    this._storeManagerService.postStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          this.getContactList('add')
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddMsg = false;
        this.isAddLoader = false;
        this._changeDetectorRef.markForCheck()
      })
  }
  removeContact(index, item): void {
    item.del_loader = true;
    let payload = {
      pk_fulfillmentContactID: item.pk_fulfillmentContactID,
      delete_fulfillment_contact: true
    }
    this._storeManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          this.dataSource = this.dataSource.filter((value) => {
            return value.pk_fulfillmentContactID != item.pk_fulfillmentContactID;
          });
          // this.dataSource._updateChangeSubscription();
          // this.dataSource = this.dataSource.filter((u) => {
          //   console.log(u)
          //   u.pk_fulfillmentContactID !== item.pk_fulfillmentContactID
          // });
          this._snackBar.open("Contact Deleted Successfully", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        item.del_loader = false;
        this._changeDetectorRef.markForCheck()
      })
  }
  updateContactList(item) {
    item.update_loader = true;
    const { fk_userID, fk_attributeID, blnPrimary, blnRevisedInvoices } = item;
    let attribute = fk_attributeID;
    if (fk_attributeID == 0) {
      attribute = null
    }
    let payload = {
      fk_userID,
      fk_attributeID: attribute,
      blnPrimary, blnRevisedInvoices,
      pk_fulfillmentContactID: item.pk_fulfillmentContactID,
      update_fulfillment_contact: true
    }
    this._storeManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          item.update_loader = false;
          this._snackBar.open("Contact Updated Successfully!!", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        item.update_loader = false;
        this._changeDetectorRef.markForCheck()
      })
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
