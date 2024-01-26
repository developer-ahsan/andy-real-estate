import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { UsersService } from '../../users.service';
import { applyBlanketCustomerPercentage, newFLPSUser, newOrderManageUser, removeFLPSUser, RemoveUser, updateFLPSUser, updateOrderManageUser, updateOrderManageUserStores } from '../../users.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-ordermanage-users',
  templateUrl: './ordermanage-users.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class OrderManageUsersComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'f_name', 'l_name', 'action'];
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
  // Active Stores
  allStores = [];
  storePage = 1;
  storeLoader: boolean = false;
  totalStores = 0;
  updateStoreLoader: boolean;

  adminUserPermissions = {
    selectOrderManageUser: false,
  }
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService,
    private _UsersService: UsersService
  ) { }

  initForm() {
    this.addNewUserForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnFulfillment: new FormControl(false),
      create_order_manage_user: new FormControl(true)
    });
    this.updateUserForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnFulfillment: new FormControl(false),
      email: new FormControl('', [Validators.required, Validators.email]),
      pk_userID: new FormControl(0),
      update_order_manage_user: new FormControl(true)
    });
  }
  ngOnInit(): void {
    this.adminUserPermissions = this._commonService.assignPermissions('orderManageUser', this.adminUserPermissions);
    this.initForm();
    this.isLoading = true;
    this.getAdminOrderUsers(1, 'get');
  };
  calledScreen(value) {
    this.initForm();
    this.mainScreen = value;
    if (this.mainScreen == 'Current Users') {
      this.dataSource = this.tempDataSource;
      this.page = 1;
      this._changeDetectorRef.markForCheck();
      if (this.dataSource.length == 0) {
        this.getAdminOrderUsers(1, 'get');
      }
    } else {
    }
  }
  calledUserScreen(value) {
    this.mainScreenUser = value;
  }
  getAdminOrderUsers(page, type) {
    let params = {
      order_manage_users: true,
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
    this.getAdminOrderUsers(this.page, 'get');
  };

  toggleUpdateUserData(data, check) {
    this.isUpdateUser = check;
    if (check) {
      this.storePage = 1;
      this.allStores = [];
      this.mainScreenUser = 'Edit User';
      this.updateUserData = data;
      this.updateUserForm.patchValue(data);
      this.getAllStores();
    }

  }

  addNewUser() {
    const { userName, password, email, firstName, lastName, blnFulfillment, create_order_manage_user } = this.addNewUserForm.getRawValue();
    if (userName.trim() == '' || password.trim() == '' || email.trim() == '' || firstName.trim() == '' || lastName.trim() == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: newOrderManageUser = {
      userName: userName.trim(),
      password: password.trim(),
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      blnFulfillment,
      create_order_manage_user
    };
    this.isAddNewUserLoader = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.tempDataSource = [];
        this.getAdminOrderUsers(1, 'add');
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
    const { userName, password, email, firstName, lastName, pk_userID, blnFulfillment, update_order_manage_user } = this.updateUserForm.getRawValue();
    if (userName.trim() == '' || password.trim() == '' || email.trim() == '' || firstName.trim() == '' || lastName.trim() == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: updateOrderManageUser = {
      userName: userName.trim(),
      password: password.trim(),
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      blnFulfillment,
      update_order_manage_user,
      pk_userID
    };
    this.isUpdateUserLoader = true;
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.updateUserData.firstName = firstName;
        this.updateUserData.lastName = lastName;
        this.updateUserData.blnFulfillment = blnFulfillment;
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
    let payload: RemoveUser = {
      user_id: item.pk_userID,
      remove_order_user: true
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
          let StoreList = ',' + this.updateUserData.storeList;
          if (StoreList.includes(',' + element.pk_storeID)) {
            element.checked = true;
          } else {
            element.checked = false;
          }
        }
        this.allStores.push(element);
      });
      this.totalStores = res["totalRecords"];
    });
  }
  getAdminStores(page) {
    let params = {
      stores: true,
      bln_active: 1,
      page: page,
      size: 20
    }
    this._UsersService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (this.updateUserData.storeList) {
          let StoreList = ',' + this.updateUserData.storeList;
          if (StoreList.includes(',' + element.pk_storeID)) {
            element.checked = true;
          } else {
            element.checked = false;
          }
        }
        this.allStores.push(element);
      });
      this.storeLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.storeLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextStoresData() {
    this.storePage++;
    this.storeLoader = true;
    this.getAdminStores(this.storePage);
  };
  updateStoresList() {
    let storesList = this.updateUserData.storeList.split(',').map(function (item) {
      return parseInt(item);
    });
    this.allStores.forEach(element => {
      if (element.checked) {
        const index = storesList.findIndex(item => Number(item) == element.pk_storeID);
        if (index < 0) {
          storesList.push(element.pk_storeID);
        }
      } else if (!element.checked) {
        const index = storesList.findIndex(item => Number(item) == element.pk_storeID);
        if (index > -1) {
          storesList.splice(index, 1);
        }
      }
    });
    let params: updateOrderManageUserStores = {
      user_id: this.updateUserData.pk_userID,
      stores: storesList,
      update_ordermanage_user_stores: true
    };
    this.updateStoreLoader = true;
    this._UsersService.UpdateAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.updateUserData.storeID = storesList.toString();
      }
      this._UsersService.snackBar(res["message"]);
      this.updateStoreLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
      this.updateStoreLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
