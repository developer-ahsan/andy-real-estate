import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-fullfilment-contacts',
  templateUrl: './fullfilment-contacts.component.html',
})
export class FullfilmentContactsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<any>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  locationsData: any;
  isPageLoading: boolean = false;
  isContactListLoading: boolean = false;

  // Table
  displayedColumns: string[] = ['Primary', 'User', 'Location', 'Revised', 'Action'];
  dataSource = [];
  usersData: any;
  contactListData: any;

  contactForm: FormGroup;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.isPageLoading = true;
    this.getLocations();
    this.getUsers();
    this.getContactList();
    this.initialize();
  }
  initialize() {
    this.contactForm = this.fb.group({
      contacts: new FormArray([])
    });
  }
  get contactListArray(): FormArray {
    return this.contactForm.get('contacts') as FormArray;
  }
  getLocations() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      contact: true,
      locations: true
    }
    this._fileManagerService.getStoresData(params)
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
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isPageLoading = false;
        this.usersData = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  getContactList() {
    this.isContactListLoading = true;
    let params = {
      store_id: this.selectedStore.pk_storeID,
      fulfillment_contact: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.isContactListLoading = false;
        this.dataSource = res["data"];
        for (let i = 0; i < res["data"].length; i++) {
          this.contactListArray.push(this.fb.group({
            'primary': this.dataSource[i] && this.dataSource[i].blnPrimary ? this.dataSource[i].blnPrimary : '',
            'user': this.dataSource[i] && this.dataSource[i].fk_userID ? this.dataSource[i].fk_userID : '',
            'location': this.dataSource[i] && this.dataSource[i].attributeName ? this.dataSource[i].attributeName : '',
            'revised': this.dataSource[i] && this.dataSource[i].blnRevisedInvoices ? this.dataSource[i].blnRevisedInvoices : ''
          }));
        }
        this._changeDetectorRef.markForCheck();
      })
  }

}
