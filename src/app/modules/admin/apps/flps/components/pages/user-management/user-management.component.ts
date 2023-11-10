import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FLPSService } from '../../flps.service';
import { applyBlanketCustomerPercentage, newFLPSUser, removeFLPSUser, updateFLPSUser } from '../../flps.types';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import moment from 'moment';

@Component({
  selector: 'app-user-flps-management',
  templateUrl: './user-management.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class FLPSUserManagementComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'f_name', 'l_name', 'admin', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;
  flpPages: any;

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
  displayedCustomersColumns: string[] = ['id', 'name', 'company', 'email', 'commission'];
  totalCustomers = 0;
  tempTotalCustomers = 0;
  customersPage = 1;
  customersLoader: boolean = true;

  fileDownloadLoader: boolean = false;

  isSearching: boolean = false;

  activeStores = [];
  storeCtrl = new FormControl();
  selectedStore: any;
  isSearchingCustomer = false;
  minLengthTerm = 3;
  searchKeyword = '';
  isFilterCustomerLoader: boolean = false;
  // Emplyees Dropdown
  employeeUser = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _flpsService: FLPSService
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
    this.getEmployeeUsers();
    this.getFlpsUsers(1, 'get');
    this._flpsService.flpsStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.activeStores.push({ storeName: 'All Stores', pk_storeID: null });
      this.selectedStore = this.activeStores[0];
      this.displayWith(this.selectedStore);
      res["data"].forEach(element => {
        this.activeStores.push(element);
      });
    })
    let params;
    this.storeCtrl.valueChanges.pipe(
      filter(res => {
        params = {
          view_stores: true,
          bln_active: 1,
          size: 20,
          keyword: res
        }
        return res !== null && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        this.activeStores = [];
        this.isSearchingCustomer = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._flpsService.getFlpsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingCustomer = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    )
      .subscribe((data: any) => {
        this.activeStores.push({ storeName: 'All Stores', pk_storeID: null });
        data["data"].forEach(element => {
          this.activeStores.push(element);
        });
      });
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
    } else if (this.mainScreenUser == 'View Customers') {
      this.customersDataSource = this.tempCustomersDataSource;
      this.customersPage = 1;
      this._changeDetectorRef.markForCheck();
      if (this.customersDataSource.length == 0) {
        this.getUserCustomers(1);
      }
    }
  }
  getFlpsUsers(page, type) {
    let params = {
      login_check: true,
      bln_active: 1,
      page: page,
      size: 20
    }
    this._flpsService.getFlpsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.flpPages = res;
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddNewUserLoader = false;
        this.initForm();
        this._flpsService.snackBar('User Added Successfully');
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
    this._flpsService.getFlpsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    this._flpsService.employeeAdmins$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
      this.customersDataSource = [];
      this.tempCustomersDataSource = [];
      this.customersPage = 1;
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
    if (userName == '' || password == '' || email == '' || adminId === null) {
      this._flpsService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: newFLPSUser = {
      userName, password, email, firstName, lastName, blnAdmin, defaultCommission: defaultCommission, admin_user_id: adminId, new_flps_user
    }
    this.isAddNewUserLoader = true;
    this._flpsService.AddFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
      this._flpsService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: updateFLPSUser = {
      userName, password, email, firstName, lastName, blnAdmin, defaultCommission: defaultCommission, admin_user_id: adminId, update_flps_user, blnActive, user_id: pk_userID
    }
    this.isUpdateUserLoader = true;
    this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
        this._flpsService.snackBar('User Updated Successfully');
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
    this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
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
      this._flpsService.snackBar('FLPS User Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._flpsService.snackBar('Something went wrong');
    });
  }
  addBlanketPercentage() {
    if (this.ngBlanketPercentage == '') {
      this._flpsService.snackBar('Please enter percentage value.');
      return;
    }
    let payload: applyBlanketCustomerPercentage = {
      user_id: this.updateUserData.pk_userID,
      percentage: Number(this.ngBlanketPercentage),
      apply_blanket_percentage: true
    }
    this.isBlanketLoader = true;
    this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._flpsService.snackBar(res["message"]);
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
    this._flpsService.getFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      
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
  // Get Customers Associated
  getUserCustomers(page) {
    let payload = {
      user_customers: true,
      flps_user_id: this.updateUserData.pk_userID,
      page: page,
      size: 20,
      store_id: null,
      keyword: ''
    };
    if (this.isFilterCustomerLoader) {
      payload.store_id = this.selectedStore.pk_storeID;
      payload.keyword = this.searchKeyword;
    } else {
      if (page == 1) {
        this.customersLoader = true;
      }
    }
    this._flpsService.getFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.customersDataSource = res["data"];
      this.totalCustomers = res["totalRecords"];
      if (this.tempOrdersDataSource.length == 0 && !this.isFilterCustomerLoader) {
        this.tempCustomersDataSource = res["data"];
        this.tempTotalCustomers = res["totalRecords"];
      }
      this.isFilterCustomerLoader = false;
      this.customersLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFilterCustomerLoader = false;
      this.customersLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextCustomersData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.customersPage++;
    } else {
      this.customersPage--;
    };
    this.getUserCustomers(this.customersPage);
  };
  downloadExcelWorkSheet() {
    let payload = {
      user_customers: true,
      flps_user_id: this.updateUserData.pk_userID,
      size: this.totalCustomers
    };
    this.fileDownloadLoader = true;
    this._flpsService.getFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      const fileName = `FLPSUser-${moment(new Date()).format('MM-DD-yy-hh-mm-ss')}`;
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet("Customers");
      // Columns
      worksheet.columns = [
        { header: "ID", key: "fk_FLPSUserID", width: 30 },
        { header: "First Name", key: "firstName", width: 30 },
        { header: "last Name", key: "lastName", width: 30 },
        { header: "Company", key: "companyName", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Commission", key: "commission", width: 10 }
      ];
      for (const obj of res["data"]) {
        worksheet.addRow(obj);
      }
      this.fileDownloadLoader = false;
      workbook.xlsx.writeBuffer().then((data: any) => {
        const blob = new Blob([data], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("style", "display: none");
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });

      // Mark for check
      this._changeDetectorRef.markForCheck();

    }, err => {
      this._flpsService.snackBar('Something went wrong');
      this.fileDownloadLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  onSelected(ev) {
    this.selectedStore = ev.option.value;
  }

  displayWith(value: any) {
    return value ? value?.storeName : '';
  }
  filterCustomers() {
    this.isFilterCustomerLoader = true;
    this.getUserCustomers(1);
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
