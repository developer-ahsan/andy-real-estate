import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UsersService } from '../../users.service';
import { AddAdminUser, applyBlanketCustomerPercentage, newFLPSUser, removeFLPSUser, UpdateAdminUser, updateFLPSUser } from '../../users.types';
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

  permissionGroup = [];
  permissionGrpCtrl = new FormControl();
  selectedPermission: any;
  permissionLoader = false;

  ipAddress = '';

  // Parent Permission
  parentTotalPermissions = 0;
  parentPermissionData: any = [];
  parentPermissionPage = 1;
  parentPermissionLoader: boolean = false;
  isLoadingPermission: boolean = false;

  childTotalPermissions = 0;
  childPermissionData: any = [];
  childPermissionPage = 1;
  childPermissionLoader: boolean = false;
  isLoadingChildPermission: boolean = false;

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
      ip_address: new FormControl(''),
      supplier_id: new FormControl(''),
      blnMasterAccount: new FormControl(false),
      blnSupplier: new FormControl(true),
      blnManager: new FormControl(false),
      add_admin_user: new FormControl(true)
    });
    this.updateUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnActive: new FormControl(false),
      blnMaster: new FormControl(false),
      blnManager: new FormControl(false),
      pk_userID: new FormControl(0),
      update_admin_user: new FormControl(true)
    });
    if (this.ipAddress) {
      this.addNewUserForm.patchValue({ ip_address: this.ipAddress });
    }
    if (this.addCompanies.length > 0) {
      this.addNewUserForm.patchValue({ supplier_id: this.addCompanies[0].pk_companyID });
    }
  }
  ngOnInit(): void {
    this.initForm();
    this._UsersService.getIPAddress().subscribe(res => {
      this.ipAddress = res["ip"];
    });
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
    ).subscribe((data: any) => {
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
    this.addNewUserForm.setValue({ supplier_id: this.addCompanies[0].pk_companyID });
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
    if (this.mainScreenUser == 'Permissions') {
      let params;
      this.permissionGrpCtrl.setValue({ groupName: 'None', pk_companyID: null });
      this.permissionGrpCtrl.valueChanges.pipe(
        filter((res: any) => {
          params = {
            permission_groups: true,
            keyword: res
          }
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(500),
        tap(() => {
          this.permissionGroup = [];
          this.permissionLoader = true;
          this._changeDetectorRef.markForCheck();
        }),
        switchMap(value => this._UsersService.getAdminsData(params)
          .pipe(
            finalize(() => {
              this.permissionLoader = false
              this._changeDetectorRef.markForCheck();
            }),
          )
        )
      ).subscribe((data: any) => {
        this.permissionGroup.push({ groupName: 'None', pk_groupID: null });
        this.permissionGroup = this.permissionGroup.concat(data['data']);
      });
      if (this.parentPermissionData.length == 0) {
        this.permissionLoader = true;
        this.getParentPermissions(1);
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
        this.mainScreen = 'Admin Users';
        this._UsersService.snackBar('User Added Successfully');
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
    const { userName, password, email, firstName, lastName, blnManager, blnSupplier, blnMasterAccount, supplier_id, ip_address, add_admin_user } = this.addNewUserForm.getRawValue();
    if (userName == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddAdminUser = {
      userName, password, email, firstName, lastName, blnManager, blnSupplier, blnMasterAccount, supplier_id, ip_address, add_admin_user
    }
    this.isAddNewUserLoader = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.getAdminUsers(1, 'add');
      } else {
        this._UsersService.snackBar(res["message"]);
        this.isAddNewUserLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddNewUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateUser() {
    const { userName, password, email, firstName, lastName, blnManager, blnMaster, blnActive, pk_userID, update_admin_user } = this.updateUserForm.getRawValue();
    if (userName == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: UpdateAdminUser = {
      userName, password, email, firstName, lastName, blnActive, blnMaster, blnManager, update_admin_user, user_id: pk_userID
    }
    this.isUpdateUserLoader = true;
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        let arr = [];
        this.updateUserData.firstName = firstName;
        this.updateUserData.lastName = lastName;
        this.updateUserData.blnMaster = blnMaster;
        this.updateUserData.blnManager = blnManager;
        this.updateUserData.pk_userID = pk_userID;
        this.updateUserData.userName = userName;
        this.updateUserData.password = password;
        this.updateUserData.email = email;
        if (this.updateUserData.blnActive == blnActive) {
          this.updateUserData.blnActive = blnActive;
        } else {
          if (this.updateUserData.blnActive) {
            this.updateUserData.blnActive = blnActive;
            arr = this.disabledDataSource;
            if (this.disabledDataSource.length > 0) {
              this.dataSource = this.dataSource.filter(elem => elem.pk_userID != pk_userID);
              this.totalUsers--;
              this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_userID != pk_userID);
              this.tempRecords--;
              arr.push(this.updateUserData);
              this.disabledDataSource = arr;
              this.distabledTotalUsers++;
              this.temdisabledDataSource = arr;
              this.tempdistabledTotalUsers++;
            }
          } else {
            this.updateUserData.blnActive = blnActive;
            arr = this.dataSource;
            if (this.dataSource.length > 0) {
              this.disabledDataSource = this.disabledDataSource.filter(elem => elem.pk_userID != pk_userID);
              this.distabledTotalUsers--;
              this.temdisabledDataSource = this.temdisabledDataSource.filter(elem => elem.pk_userID != pk_userID);
              this.tempdistabledTotalUsers--;
              arr.push(this.updateUserData);
              this.dataSource = arr;
              this.totalUsers++;
              this.tempDataSource = arr;
              this.tempRecords++;
            }

          }
        }
        this.isUpdateUserLoader = false;
        this._UsersService.snackBar('User Updated Successfully');
        this._changeDetectorRef.markForCheck();
      } else {
        this._UsersService.snackBar(res["message"]);
        this.isUpdateUserLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this._UsersService.snackBar('Something went wrong');
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
      this._UsersService.snackBar('Admin User Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
    });
  }
  getParentPermissions(page) {
    let params = {
      parent_permission_groups: true,
      page: page,
      size: 20
    }
    let permission = [];
    if (this.parentPermissionData) {
      permission = this.parentPermissionData;
    }
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.parentPermissionData = permission.concat(res["data"]);
      this.parentTotalPermissions = res["totalRecords"];
      this.isLoadingPermission = false;
      this.permissionLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingPermission = false;
      this.permissionLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextPermissionParentData() {
    this.isLoadingPermission = true;
    this.parentPermissionPage++;
    this.getParentPermissions(this.parentPermissionPage);
  };

  getChildPermissions(item) {
    let params = {
      child_permission_groups: true,
      parent_id: item.pk_sectionID,
      page: item.childPage,
      size: 20
    }
    let permission = item.childPermission;
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.childPermission = permission.concat(res["data"]);
      item.childTotal = res["totalRecords"];
      item.childLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.childLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  loadMoreChildPermissions(item) {
    if (!item.childPermission) {
      item.childPermission = [];
      item.childPage = 1;
      item.childTotal = 0;
      item.childLoader = true;
    } else {
      item.childPage++;
      item.childLoader = true;
    }
    this.getChildPermissions(item);
    console.log(item.pk_sectionID);
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
