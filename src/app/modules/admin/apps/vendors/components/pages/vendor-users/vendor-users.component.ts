import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import { FormControl, FormGroup } from '@angular/forms';
import { AddAdminUser, AddFOBLocation, DeleteAdminUser, RemoveFOBLocation, updateAdminUser } from '../../vendors.types';

@Component({
  selector: 'app-vendor-users',
  templateUrl: './vendor-users.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorUsersComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'first', 'last', 'company', 'logged', 'master', 'action'];
  totalUsers = 0;
  tempTotalUsers = 0;
  page = 1;
  not_available = 'N/A';

  supplierData: any;

  mainScreen = 'Current'

  // States
  allStates = [];
  tempStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  // Location Data for Update
  usersData: any;
  isUpdate: boolean = false;
  userPayload = {
    userName: '',
    userID: 0,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    blnActive: true,
    blnManager: true,
    blnMasterAccount: true,
    update_vendor_user: true
  }

  // Add FOB Location
  addUserForm: FormGroup;
  isAddLoader: boolean = false;

  // Search By Keyword
  isSearching: boolean = false;
  keyword = '';
  isUpdateLoader: boolean;
  ipAddress: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  initForm() {
    this.addUserForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      userName: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl('')
    });
  }
  ngOnInit(): void {
    this.initForm();
    this._vendorService.getIPAddress().subscribe(res => {
      this.ipAddress = res["ip"];
    });
    this.isLoading = true;
    this.getVendorsData();
  };
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Add New User') {
      this.initForm();
    } else {
      this.page = 1;
      this.dataSource = this.tempDataSource;
      this.totalUsers = this.tempTotalUsers;
      this._changeDetectorRef.markForCheck();
    }
  }
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getVendorsUsers(1, 'get');
    })
  }
  getVendorsUsers(page, type) {
    let params = {
      vendor_users: true,
      page: page,
      keyword: this.keyword,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempTotalUsers = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddLoader = false;
        this.initForm();
        this.mainScreen = 'Current';
        this._vendorService.snackBar('Vendor user added successfully');
      }
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getVendorsUsers(this.page, 'get');
  };
  // Search By Keyword
  searchUsers() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getVendorsUsers(1, 'get');
  }
  resetSearch() {
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempTotalUsers;
    if (this.dataSource.length > 0) {
      if (this.page > 1) {
        this.paginator.firstPage();
      }
    }
    this.page = 1;
    this._changeDetectorRef.markForCheck();
  }
  // Add New User
  addNewUser() {
    const { firstName, lastName, userName, password, email } = this.addUserForm.getRawValue();
    if (firstName == '' || lastName == '' || userName == '' || password == '' || email == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddAdminUser = {
      firstName, lastName, userName, password, email,
      registerIP: this.ipAddress,
      supplier_id: this.supplierData.pk_companyID,
      blnMasterAccount: false,
      blnManager: false,
      create_vendor_user: true
    }
    this.isAddLoader = true;
    this._vendorService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getVendorsUsers(1, 'add');
      } else {
        this.isAddLoader = false;
        this._vendorService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // RemoveUser
  deleteUser(user) {
    user.delLoader = true;
    let payload: DeleteAdminUser = {
      delete_vendor_admin: true,
      user_id: user.pk_userID
    }
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      user.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.dataSource = this.dataSource.filter(item => item.pk_userID != user.pk_userID);
        this.totalUsers--;
        this.tempDataSource = this.tempDataSource.filter(item => item.pk_userID != user.pk_userID);
        this.tempTotalUsers--;
      }
      this._vendorService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      user.delLoader = false;
      this._vendorService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    });
  }
  toggleUpdate(data) {
    this.isUpdate = true;
    this.usersData = data;
    this.userPayload = {
      userName: data.userName,
      userID: data.pk_userID,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      blnActive: data.blnActive,
      blnManager: data.blnManager,
      blnMasterAccount: data.blnMasterAccount,
      update_vendor_user: true
    }
    this.searchStateCtrl.setValue(data.state, { emitEvent: false });
    this.selectedState = data.state;
  }
  updateUsers() {
    const { userID, userName, firstName, lastName, email, password, blnActive, blnManager, blnMasterAccount, update_vendor_user } = this.userPayload;
    if (userName == '' || firstName == '' || email == '' || password == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: updateAdminUser = { userID, userName, firstName, lastName, email, password, blnActive, blnManager, blnMasterAccount, update_vendor_user };
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.usersData.firstName = firstName;
        this.usersData.lastName = lastName;
        this.usersData.userName = userName;
        this.usersData.password = password;
        this.usersData.email = email;
      }
      this.isUpdateLoader = false;
      this._vendorService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  backTolist() {
    this.isUpdate = false;
    this._changeDetectorRef.markForCheck();
  }

  onSelected(ev) {
    this.selectedState = ev.option.value;
  }

  displayWith(value: any) {
    return value;
  }
  onBlur() {
    this.searchStateCtrl.setValue(this.selectedState, { emitEvent: false });
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
