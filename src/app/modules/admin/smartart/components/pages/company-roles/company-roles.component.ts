import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { items } from 'app/mock-api/apps/file-manager/data';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { UsersService } from '../../users.service';
import { AddRole, AddRoleEmployee, addUserRoleProgram, applyBlanketCustomerPercentage, deleteUserRoleProgram, newFLPSUser, RemoveEmployeeRole, removeFLPSUser, RemoveRole, updateFLPSUser, updateRole } from '../../users.types';
@Component({
  selector: 'app-company-roles',
  templateUrl: './company-roles.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CompanyRolesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['role', 'action'];
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

  keyword = '';
  not_available = 'N/A';

  mainScreenUser: string = 'Current Users';

  ngBlanketPercentage = '';
  isBlanketLoader: boolean = false;

  // User Orders
  employeeRoleLoader: boolean = true;
  employeeRoleDataSource = [];
  tempemployeeRoleDataSource = [];
  displayedemployeeRoleColumns: string[] = ['name', 'email', 'roleName', 'action'];
  totalemployeeRole = 0;
  tempEmployeeRecords = 0;
  employeeRolePage = 1;

  // User Customers
  customersDataSource = [];
  tempCustomersDataSource = [];
  displayedCustomersColumns: string[] = ['id', 'name', 'company', 'email', 'last', 'commission'];
  totalCustomers = 0;
  tempTotalCustomers = 0;
  customersPage = 1;

  isSearching: boolean = false;
  // Emplyees Dropdown
  isAddNewrole: boolean = false;
  ngRole = '';
  isAddNewEmployeeRole: boolean = false;

  // Role Users
  allRoleUsers: any;
  totalRoleUser = 0;
  roleUserPage = 1;
  isRoleUserLoader: boolean = false;
  // Programs

  employeeData: any;


  currentPrograms = [];
  tempCurrentPrograms = [];
  displayedCurrentProgramsColumns: string[] = ['name', 'action'];
  totalPrograms = 0;
  tempTotalPrograms = 0;
  programsPage = 1;
  isShowPrograms: boolean = false;
  programsLoader: boolean = false;

  allProgramUsers: any;
  totalProgramUser = 0;
  programUserPage = 1;
  isProgramUserLoader: boolean = false;

  mainScreenProgram: string = 'Current Programs';

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
    this.getAdminRoles(1, 'get');
  };
  calledUserScreen(value) {
    this.mainScreenUser = value;
    if (value == 'Current Users') {
      this.employeeRoleDataSource = this.tempemployeeRoleDataSource;
      this.employeeRolePage = 1;
      this._changeDetectorRef.markForCheck();
      if (this.employeeRoleDataSource.length == 0) {
        this.employeeRoleLoader = true;
        this.getAdminEmployeeRoles(1, 'get');
      }
    } else if (value == 'Add Users') {
      if (!this.allRoleUsers) {
        this.isRoleUserLoader = true;
        this.getRoleUsers(1);
      }
    }
  }

  getAdminRoles(page, type) {
    let params = {
      roles: true,
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
        this.ngRole = '';
        this.isAddNewrole = false;
        this._UsersService.snackBar('Role Added Successfully');
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
    this.getAdminRoles(this.page, 'get');
  };

  addNewUser() {
    if (!this.ngRole) {
      this._UsersService.snackBar('Role field is required');
      return;
    }
    let payload: AddRole = {
      roleName: this.ngRole,
      create_role: true
    }
    this.isAddNewrole = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.getAdminRoles(1, 'add');
      } else {
        this._UsersService.snackBar(res["message"]);
        this.isAddNewrole = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddNewrole = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateUser(item) {
    if (!item.roleName) {
      this._UsersService.snackBar('Role field is required');
      return;
    }
    item.updateLoader = true;
    // return
    let payload: updateRole = {
      role_name: item.roleName,
      role_id: item.pk_roleID,
      update_role: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._UsersService.snackBar('Role Updated Successfully');
        item.updateLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteUser(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: RemoveRole = {
      role_id: item.pk_roleID,
      remove_role: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_roleID != item.pk_roleID);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_roleID != item.pk_roleID);
      this.tempRecords--;
      this._UsersService.snackBar('Employee Role Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
    });
  }

  toggleUpdateUserData(data, check) {
    this.isUpdateUser = check;
    if (check) {
      this.allRoleUsers = null;
      this.employeeRoleDataSource = [];
      this.tempemployeeRoleDataSource = [];
      this.employeeRolePage = 1;
      this.roleUserPage = 1;
      this.updateUserData = data;
      this.calledUserScreen('Current Users')
    }
  }
  getAdminEmployeeRoles(page, type) {
    let params = {
      role_employees: true,
      role_id: this.updateUserData.pk_roleID,
      page: page,
      size: 20
    }
    this.tempemployeeRoleDataSource = [];
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.employeeRoleDataSource = res["data"];
      this.totalemployeeRole = res["totalRecords"];
      if (this.tempemployeeRoleDataSource.length == 0) {
        this.tempemployeeRoleDataSource = res["data"];
        this.tempEmployeeRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this._UsersService.snackBar('Employee Added Successfully');
      }
      this.employeeRoleLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.employeeRoleLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextEmployeeRoleData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.employeeRolePage++;
    } else {
      this.employeeRolePage--;
    };
    this.getAdminEmployeeRoles(this.employeeRolePage, 'get');
  };
  deleteEmployeeUser(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: RemoveEmployeeRole = {
      admin_user_id: item.pk_userID,
      role_id: this.updateUserData.pk_roleID,
      remove_employee_role: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.employeeRoleDataSource = this.employeeRoleDataSource.filter(elem => elem.pk_userID != item.pk_userID);
      this.totalemployeeRole--;
      this.tempemployeeRoleDataSource = this.tempemployeeRoleDataSource.filter(elem => elem.pk_userID != item.pk_userID);
      this.tempRecords--;
      this._UsersService.snackBar('Employee Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
    });
  }
  addNewRoleEmployee(item) {
    let payload: AddRoleEmployee = {
      admin_user_id: item.pk_userID,
      role_id: this.updateUserData.pk_roleID,
      create_role_employee: true
    }
    item.isAddLoader = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.allRoleUsers = this.allRoleUsers.filter(elem => elem.pk_userID != item.pk_userID);
        this.getAdminEmployeeRoles(1, 'add');
      } else {
        this._UsersService.snackBar(res["message"]);
        item.isAddLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getRoleUsers(page) {
    let params = {
      all_employees: true,
      role_id: this.updateUserData.pk_roleID,
      page: page,
      size: 10
    }
    let users = [];
    if (this.allRoleUsers) {
      users = this.allRoleUsers;
    }
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allRoleUsers = users.concat(res["data"]);
      this.totalRoleUser = res["totalRecords"];
      this.isRoleUserLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRoleUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextRoleUserData() {
    this.isRoleUserLoader = true;
    this.roleUserPage++;
    this.getRoleUsers(this.roleUserPage);
  };
  calledProgramScreen(value) {
    this.mainScreenProgram = value;
    if (value == 'Current Programs') {
      this.currentPrograms = this.tempCurrentPrograms;
      this.programsPage = 1;
      if (this.currentPrograms.length == 0) {
        this.programsLoader = true;
        this.getEmployeePrograms(1, 'get');
      }
    } else if (value == 'Add Programs') {
      if (!this.allProgramUsers) {
        this.isProgramUserLoader = true;
        this.getUsersPrograms(1);
      }
    }
  }
  showPrograms(item) {
    this.employeeData = item;
    this.tempCurrentPrograms = [];
    this.currentPrograms = [];
    this.isShowPrograms = true;
    this.programsPage = 1;
    this.programUserPage = 1;
    this.programsLoader = true;
    this.allProgramUsers = null;
    this._changeDetectorRef.markForCheck();
    this.getEmployeePrograms(1, 'get');
  }
  backToUsersList() {
    this.isShowPrograms = false;
    this.mainScreenProgram = 'Current Programs';
    this._changeDetectorRef.markForCheck();
  }
  getEmployeePrograms(page, type) {
    let params = {
      user_role_programs: true,
      role_id: this.updateUserData.pk_roleID,
      user_id: this.employeeData.pk_userID,
      page: page,
      size: 20
    }
    this.tempCurrentPrograms = [];
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentPrograms = res["data"];
      this.totalPrograms = res["totalRecords"];
      if (this.tempCurrentPrograms.length == 0) {
        this.tempCurrentPrograms = res["data"];
        this.tempTotalPrograms = res["totalRecords"];
      }
      if (type == 'add') {
        this._UsersService.snackBar('Program Added Successfully');
      }
      this.programsLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.programsLoader = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextEmployeeProgram(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.programsPage++;
    } else {
      this.programsPage--;
    };
    this.getEmployeePrograms(this.programsPage, 'get');
  };
  deleteEmployeeProgram(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: deleteUserRoleProgram = {
      admin_user_id: this.employeeData.pk_userID,
      role_id: this.updateUserData.pk_roleID,
      store_id: item.pk_storeID,
      delete_user_role_program: true
    }
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.currentPrograms = this.currentPrograms.filter(elem => elem.pk_storeID != item.pk_storeID);
      this.totalPrograms--;
      this.tempCurrentPrograms = this.tempCurrentPrograms.filter(elem => elem.pk_storeID != item.pk_storeID);
      this.tempTotalPrograms--;
      this.allProgramUsers = null;
      this._UsersService.snackBar('Program Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._UsersService.snackBar('Something went wrong');
    });
  }

  getUsersPrograms(page) {
    let params = {
      all_programs: true,
      role_id: this.updateUserData.pk_roleID,
      user_id: this.employeeData.pk_userID,
      page: page,
      size: 10
    }
    let users = [];
    if (this.allProgramUsers) {
      users = this.allProgramUsers;
    }
    this._UsersService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allProgramUsers = users.concat(res["data"]);
      this.totalProgramUser = res["totalRecords"];
      this.isProgramUserLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isProgramUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextUserProgramData() {
    this.isProgramUserLoader = true;
    this.programUserPage++;
    this.getUsersPrograms(this.programUserPage);
  };

  addNewProgramEmployee(item) {
    let payload: addUserRoleProgram = {
      admin_user_id: this.employeeData.pk_userID,
      role_id: this.updateUserData.pk_roleID,
      store_id: item.pk_storeID,
      add_user_role_program: true
    }
    item.isAddLoader = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.allProgramUsers = this.allProgramUsers.filter(elem => elem.pk_storeID != item.pk_storeID);
        this.programsPage = 1;
        this.getEmployeePrograms(1, 'add');
      } else {
        this._UsersService.snackBar(res["message"]);
        item.isAddLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      item.isAddLoader = false;
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
