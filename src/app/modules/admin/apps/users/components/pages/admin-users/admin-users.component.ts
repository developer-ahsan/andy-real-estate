import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UsersService } from '../../users.service';
import { applyBlanketCustomerPercentage, newFLPSUser, removeFLPSUser, updateFLPSUser } from '../../users.types';
@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'name', 'company', 'lastLogged', 'active', 'master', 'action'];
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

  mainScreen: string = 'Admin Users';
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
  companies = [];
  searchCompanyCtrl = new FormControl();
  selectedCompany: any;
  isSearchingCompany = false;
  minLengthTerm = 3;

  addCompanies = [];
  addSearchCompanyCtrl = new FormControl();
  addSelectedCompany: any;
  addIsSearchingCompany = false;

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
    this.initForm();
    this.isLoading = true;
    this.getAdminCompanies();
    this.getAdminUsers(1, 'get');
    let params;
    this.searchCompanyCtrl.setValue({ companyName: 'All', pk_companyID: null });
    this.searchCompanyCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          companies: true,
          keyword: res
        }
        return res !== null && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        this.companies = [];
        this.isSearchingCompany = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._UsersService.getAdminsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingCompany = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    )
      .subscribe((data: any) => {
        this.companies.push({ companyName: 'All', pk_companyID: null });
        this.companies = this.companies.concat(data['data']);
      });

    this.addSearchCompanyCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          companies: true,
          keyword: res
        }
        return res !== null && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        this.addCompanies = [];
        this.addIsSearchingCompany = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._UsersService.getAdminsData(params)
        .pipe(
          finalize(() => {
            this.addIsSearchingCompany = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    )
      .subscribe((data: any) => {
        this.addCompanies = data['data'];
      });
  };
  onSelected(ev) {
    this.selectedCompany = ev.option.value;
    if (this.selectedCompany.companyName == 'All') {
      this.dataSource = this.tempDataSource;
      this.page = 1;
      this.totalUsers = this.tempRecords;
      this._changeDetectorRef.markForCheck();
    } else {
      this.isLoading = true;
      this.getAdminUsers(1, 'get');
    }
  }

  displayWith(value: any) {
    return value?.companyName;
  }
  addOnSelected(ev) {
    this.addSelectedCompany = ev.option.value;
  }

  addDisplayWith(value: any) {
    return value?.companyName;
  }
  calledScreen(value) {
    this.initForm();
    this.mainScreen = value;
    if (this.mainScreen == 'Current Users') {
      this.dataSource = this.tempDataSource;
      this.page = 1;
      this._changeDetectorRef.markForCheck();
      if (this.dataSource.length == 0) {
        this.getAdminUsers(1, 'get');
      }
    } else if (this.mainScreen == 'View Disabled Users') {
      this.disabledDataSource = this.temdisabledDataSource;
      this.disabledPage = 1;
      this._changeDetectorRef.markForCheck();
      if (this.disabledDataSource.length == 0) {
        this.getDisabledAdminUsers(1);
      }
    } else {
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
  getAdminUsers(page, type) {
    let params = {
      admin_users: true,
      user_status: 1,
      page: page,
      company_id: this.selectedCompany.pk_companyID,
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
  getDisabledAdminUsers(page) {
    let params = {
      admin_users: true,
      user_status: 0,
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
  getAdminCompanies() {
    this._UsersService.companyAdmins$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.companies.push({ companyName: 'All', pk_companyID: null });
      this.companies = this.companies.concat(res['data']);
      this.selectedCompany = this.companies[0];
      this.addSelectedCompany = this.companies[0];
      this.addCompanies = res['data'];
      this.addSearchCompanyCtrl.setValue({ companyName: this.addCompanies[0].companyName, pk_companyID: this.addCompanies[0].pk_companyID });
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getAdminUsers(this.page, 'get');
  };
  getNextDisabledData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.disabledPage++;
    } else {
      this.disabledPage--;
    };
    this.getDisabledAdminUsers(this.disabledPage);
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
    this.getAdminUsers(1, 'get');
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
        this.getAdminUsers(1, 'add');
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
