import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { UsersService } from '../../users.service';
import { applyBlanketCustomerPercentage, newFLPSUser, newRapidbuildUser, removeFLPSUser, RemoveRapidUser, updateFLPSUser, updateRapidbuildUser } from '../../users.types';
@Component({
  selector: 'app-rapidbuild-users',
  templateUrl: './rapidbuild-users.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RapidBuildUsersComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'f_name', 'l_name', 'admin', 'last', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;


  addNewUserForm: FormGroup;
  isAddNewUserLoader: boolean = false;

  updateUserForm: FormGroup;
  isUpdateUserLoader: boolean = false;
  isUpdateUser: boolean = false;
  updateUserData: any;

  mainScreen: string = 'Current Users';
  keyword = '';
  not_available = 'N/A';

  mainScreenUser: string = 'Edit User';

  // User Customers
  customersDataSource = [];
  tempCustomersDataSource = [];
  displayedCustomersColumns: string[] = ['id', 'name', 'company', 'email', 'last', 'commission'];
  totalCustomers = 0;
  tempTotalCustomers = 0;
  customersPage = 1;

  isSearching: boolean = false;

  // Active Stores
  allStores = [];
  storePage = 1;
  storeLoader: boolean = false;
  totalStores = 0;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _UsersService: UsersService
  ) { }

  initForm() {
    this.addNewUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnFullColor: new FormControl(false),
      blnMaster: new FormControl(false),
      create_rapidbuild_user: new FormControl(true)
    });
    this.updateUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnFullColor: new FormControl(false),
      blnMaster: new FormControl(false),
      email: new FormControl(''),
      pk_userID: new FormControl(0),
      update_rapidbuild_user: new FormControl(true)
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.getAdminRapidUsers(1, 'get');
  };
  calledScreen(value) {
    this.initForm();
    this.mainScreen = value;
    if (this.mainScreen == 'Current Users') {
      this.dataSource = this.tempDataSource;
      this.page = 1;
      this._changeDetectorRef.markForCheck();
      if (this.dataSource.length == 0) {
        this.getAdminRapidUsers(1, 'get');
      }
    } else {
    }
  }
  calledUserScreen(value) {
    this.mainScreenUser = value;
  }
  getAdminRapidUsers(page, type) {
    let params = {
      rapid_build_users: true,
      page: page,
      size: 20
    }
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddNewUserLoader = false;
        this.initForm();
        this._UsersService.snackBar('User Added Successfully');
        this.mainScreen = 'Current Users';
      }
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      // this.isLoadingChange.emit(false);
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
    this.getAdminRapidUsers(this.page, 'get');
  };

  toggleUpdateUserData(data, check) {
    this.isUpdateUser = check;
    if (check) {
      this.allStores = [];
      this.storePage = 1;
      this.mainScreenUser = 'Edit User';
      this.updateUserData = data;
      this.updateUserForm.patchValue(data);
      this.getAllStores();
    }

  }


  addNewUser() {
    const { userName, password, email, firstName, lastName, blnFullColor, blnMaster, create_rapidbuild_user } = this.addNewUserForm.getRawValue();
    if (userName == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: newRapidbuildUser = {
      userName, password, email, firstName, lastName, blnFullColor, blnMaster, create_rapidbuild_user
    }
    this.isAddNewUserLoader = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.tempDataSource = [];
        this.getAdminRapidUsers(1, 'add');
      } else {
        this._UsersService.snackBar(res["message"]);
        this.isAddNewUserLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this._UsersService.snackBar('Something went wrong');
      this.isAddNewUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateUser() {
    const { userName, password, email, firstName, lastName, pk_userID, blnFullColor, blnMaster, update_rapidbuild_user } = this.updateUserForm.getRawValue();
    if (userName == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: updateRapidbuildUser = {
      userName, password, email, firstName, lastName, blnFullColor, blnMaster, update_rapidbuild_user, pk_userID
    }
    this.isUpdateUserLoader = true;
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.updateUserData.firstName = firstName;
        this.updateUserData.lastName = lastName;
        this.updateUserData.blnMaster = blnMaster;
        this.updateUserData.blnFullColor = blnFullColor;
        this.updateUserData.pk_userID = pk_userID;
        this.updateUserData.userName = userName;
        this.updateUserData.password = password;
        this.updateUserData.email = email;
        this.isUpdateUserLoader = false;
        this._UsersService.snackBar('User Updated Successfully');
        this._changeDetectorRef.markForCheck();
      } else {
        this._UsersService.snackBar(res["message"]);
        this.isUpdateUserLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isUpdateUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteUser(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: RemoveRapidUser = {
      user_id: item.pk_userID,
      remove_rapidbuild_user: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_userID != item.pk_userID);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_userID != item.pk_userID);
      this.tempRecords--;
      this._UsersService.snackBar('User Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
    });
  }

  getAllStores() {
    this._UsersService.adminStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (this.updateUserData.storeList) {
          if (this.updateUserData.storeList.includes(element.pk_storeID)) {
            element.checked = true;
          }
        }
        this.allStores.push(element);
      });
      this.totalStores = res["totalRecords"];
    });
  }
  getAdminStores(page) {
    let params = {
      view_stores: true,
      bln_active: 1,
      page: page,
      size: 20
    }
    this._UsersService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (this.updateUserData.storeList.includes(element.pk_storeID)) {
          element.checked = true;
        }
        this.allStores.push(element);
      });
      this.storeLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.storeLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextStoresData() {
    this.storePage++;
    this.storeLoader = true;
    this.getAdminStores(this.storePage);
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
