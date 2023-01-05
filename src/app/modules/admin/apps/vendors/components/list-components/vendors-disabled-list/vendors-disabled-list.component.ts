import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { newFLPSUser, updateFLPSUser, removeFLPSUser, applyBlanketCustomerPercentage } from 'app/modules/admin/apps/flps/components/flps.types';
import { UsersService } from 'app/modules/admin/apps/users/components/users.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../vendors.service';
@Component({
  selector: 'app-vendors-disabled-list',
  templateUrl: './vendors-disabled-list.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorsDisabledListComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;

  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['order', 'email', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  disabledDataSource = [];
  temdisabledDataSource = [];
  disabledDisplayedColumns: string[] = ['id', 'f_name', 'l_name', 'admin', 'action'];
  distabledTotalUsers = 0;
  tempdistabledTotalUsers = 0;
  disabledPage = 1;
  isDisabledLoading: boolean = true;

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

  ngBlanketPercentage = '';
  isBlanketLoader: boolean = false;

  // User Orders
  ordersLoader: boolean = true;
  ordersDataSource = [];
  tempOrdersDataSource = [];
  displayedOrdersColumns: string[] = ['id', 'date', 'store', 'customer', 'total', 'paid', 'cancel', 'status'];
  totalOrders = 0;
  tempTotalOrders = 0;
  ordersPage = 1;

  // User Customers
  customersDataSource = [];
  tempCustomersDataSource = [];
  displayedCustomersColumns: string[] = ['id', 'name', 'company', 'email', 'last', 'commission'];
  totalCustomers = 0;
  tempTotalCustomers = 0;
  customersPage = 1;

  isSearching: boolean = false;
  // Emplyees Dropdown
  employeeUser = [];


  // Suppliers
  dataSourceSupplier = [];
  tempDataSourceSupplier = [];
  displayedColumnsSupplier: string[] = ['id', 'name', 'action'];
  totalSupplier = 0;
  temptotalSupplier = 0;
  pageSupplier = 1;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _UsersService: UsersService,
    private _vendorService: SystemService
  ) { }

  initForm() {
    this.addNewUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnAdmin: new FormControl(false),
      defaultCommission: new FormControl(''),
      admin_user_id: new FormControl(0),
      new_flps_user: new FormControl(true)
    });
    this.updateUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnAdmin: new FormControl(false),
      blnActive: new FormControl(false),
      defaultCommission: new FormControl(''),
      email: new FormControl(''),
      fk_adminUserID: new FormControl(0),
      pk_userID: new FormControl(0),
      update_flps_user: new FormControl(true)
    });
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.getSuppliers(1);
  };
  calledScreen(value) {
    this.initForm();
    this.mainScreen = value;
    if (this.mainScreen == 'Current Users') {
      this.dataSource = this.tempDataSource;
      this.page = 1;
      this._changeDetectorRef.markForCheck();
      if (this.dataSource.length == 0) {
        this.getFlpsUsers(1, 'get');
      }
    } else if (this.mainScreen == 'View Disabled Users') {
      this.disabledDataSource = this.temdisabledDataSource;
      this.disabledPage = 1;
      this._changeDetectorRef.markForCheck();
      if (this.disabledDataSource.length == 0) {
        this.getDisabledFlpsUsers(1);
      }
    } else {
      if (this.employeeUser.length == 0) {
        this.getEmployeeUsers();
      }
    }
  }
  calledUserScreen(value) {
    this.mainScreenUser = value;
    if (this.mainScreenUser == 'View Orders') {
      this.ordersDataSource = this.tempOrdersDataSource;
      this.ordersPage = 1;
      this._changeDetectorRef.markForCheck();
      if (this.ordersDataSource.length == 0) {
        this.getUserOrders(1);
      }
    }
  }
  getAllSuppliers() {
    this._vendorService.Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSourceSupplier = res["data"];
      this.totalSupplier = res["totalRecords"];
      this.tempDataSourceSupplier = res["data"];
      this.temptotalSupplier = res["totalRecords"];
    });
  }
  getNextSupplierData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.pageSupplier++;
    } else {
      this.pageSupplier--;
    };
    this.getSuppliers(this.pageSupplier);
  };
  getSuppliers(page) {
    let params = {
      supplier: true,
      bln_active: 0,
      size: 20,
      page: page
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSourceSupplier = res["data"];
      this.totalSupplier = res["totalRecords"];
      if (page == 1) {
        this.tempDataSourceSupplier = res["data"];
        this.temptotalSupplier = res["totalRecords"];
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  ViewDetails(item) {
    console.log(item)
  }
  getFlpsUsers(page, type) {
    let params = {
      login_check: true,
      bln_active: 1,
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
  getDisabledFlpsUsers(page) {
    let params = {
      login_check: true,
      bln_active: 0,
      page: page,
      size: 20
    }
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.disabledDataSource = res["data"];
      this.distabledTotalUsers = res["totalRecords"];
      if (this.temdisabledDataSource.length == 0) {
        this.temdisabledDataSource = res["data"];
        this.tempdistabledTotalUsers = res["totalRecords"];
      }
      this.isDisabledLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDisabledLoading = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getEmployeeUsers() {
    this._UsersService.employeeAdmins$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.employeeUser = res["data"];
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getFlpsUsers(this.page, 'get');
  };
  getNextDisabledData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.disabledPage++;
    } else {
      this.disabledPage--;
    };
    this.getDisabledFlpsUsers(this.disabledPage);
  };

  toggleUpdateUserData(data, check) {
    this.isUpdateUser = check;
    if (check) {
      this.ordersDataSource = [];
      this.tempOrdersDataSource = [];
      this.ordersPage = 1;
      this.mainScreenUser = 'Edit User';
      this.updateUserData = data;
      this.updateUserForm.patchValue(data);
    }

  }
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getFlpsUsers(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }

  addNewUser() {
    const { userName, password, email, firstName, lastName, blnAdmin, defaultCommission, admin_user_id, new_flps_user } = this.addNewUserForm.getRawValue();
    let adminId = admin_user_id;
    if (admin_user_id == 0) {
      adminId = null;
    }
    if (userName == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: newFLPSUser = {
      userName, password, email, firstName, lastName, blnAdmin, defaultCommission: defaultCommission, admin_user_id: adminId, new_flps_user
    }
    this.isAddNewUserLoader = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.getFlpsUsers(1, 'add');
      } else {
        this.isAddNewUserLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddNewUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateUser() {
    const { userName, password, email, firstName, lastName, blnAdmin, defaultCommission, fk_adminUserID, blnActive, pk_userID, update_flps_user } = this.updateUserForm.getRawValue();
    let adminId = fk_adminUserID;
    if (fk_adminUserID == 0) {
      adminId = null;
    }
    if (userName == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: updateFLPSUser = {
      userName, password, email, firstName, lastName, blnAdmin, defaultCommission: defaultCommission, admin_user_id: adminId, update_flps_user, blnActive, user_id: pk_userID
    }
    this.isUpdateUserLoader = true;
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        // if (this.updateUserData.blnActive != blnActive) {
        //   if(blnActive == false) {

        //   } else {

        //   }
        // }
        if (this.updateUserData.defaultCommission != defaultCommission) {
          this.updateUserForm.patchValue({
            defaultCommission: defaultCommission / 100
          });
          this.updateUserData.defaultCommission = defaultCommission / 100;
        }

        this.updateUserData.firstName = firstName;
        this.updateUserData.lastName = lastName;
        this.updateUserData.blnAdmin = blnAdmin;
        this.updateUserData.blnActive = blnActive;
        this.updateUserData.fk_adminUserID = adminId;
        this.updateUserData.pk_userID = pk_userID;
        this.updateUserData.userName = userName;
        this.updateUserData.password = password;
        this.updateUserData.email = email;

        this.isUpdateUserLoader = false;
        this._UsersService.snackBar('User Updated Successfully');
        this._changeDetectorRef.markForCheck();
      } else {
        this.isUpdateUserLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isUpdateUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteUser(item, type) {
    if (this.isUpdateUser) {
      if (item.blnActive) {
        type = 1;
      } else {
        type = 0;
      }
    }
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: removeFLPSUser = {
      user_id: item.pk_userID,
      remove_flps_user: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (type == 1) {
        this.dataSource = this.dataSource.filter(elem => elem.pk_userID != item.pk_userID);
        this.totalUsers--;
        this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_userID != item.pk_userID);
        this.tempRecords--;
      } else {
        this.disabledDataSource = this.disabledDataSource.filter(elem => elem.pk_userID != item.pk_userID);
        this.distabledTotalUsers--;
        this.temdisabledDataSource = this.temdisabledDataSource.filter(elem => elem.pk_userID != item.pk_userID);
        this.tempdistabledTotalUsers--;
      }
      if (this.isUpdateUser) {
        this.isUpdateUser = false;
      }
      this._UsersService.snackBar('FLPS User Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
    });
  }
  addBlanketPercentage() {
    if (this.ngBlanketPercentage == '') {
      this._UsersService.snackBar('Please enter percentage value.');
      return;
    }
    let payload: applyBlanketCustomerPercentage = {
      user_id: this.updateUserData.pk_userID,
      percentage: Number(this.ngBlanketPercentage),
      apply_blanket_percentage: true
    }
    this.isBlanketLoader = true;
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._UsersService.snackBar(res["message"]);
      this.isBlanketLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isBlanketLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Get Orders Associated
  getUserOrders(page) {
    let payload = {
      view_user_orders: true,
      user_id: this.updateUserData.pk_userID,
      page: page,
      size: 20
    };
    this.ordersLoader = true;
    this._UsersService.getAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.ordersDataSource = res["data"];
      this.totalOrders = res["totalRecords"];
      if (this.tempOrdersDataSource.length == 0) {
        this.tempOrdersDataSource = res["data"];
        this.tempTotalOrders = res["totalRecords"];
      }
      this.ordersLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.ordersLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextOrderdData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.ordersPage++;
    } else {
      this.ordersPage--;
    };
    this.getUserOrders(this.ordersPage);
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
