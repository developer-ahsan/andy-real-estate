import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { UsersService } from '../../users.service';
import { AddSmartArtUser, applyBlanketCustomerPercentage, newFLPSUser, removeFLPSUser, RemoveSmartArtUser, updateFLPSUser, UpdateSmartUser } from '../../users.types';
@Component({
  selector: 'app-smartart-users',
  templateUrl: './smartart-users.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class SmartArtUsersComponent implements OnInit, OnDestroy {
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

  disabledDataSource = [];
  temdisabledDataSource = [];
  disabledDisplayedColumns: string[] = ['id', 'f_name', 'l_name', 'action'];
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



  isSearching: boolean = false;
  // Emplyees Dropdown
  employeeUser = [];
  isActive: boolean = false;

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
      username: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      bln_master: new FormControl(false),
      add_smartuser: new FormControl(true)
    });
    this.updateUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnMaster: new FormControl(false),
      blnActive: new FormControl(false),
      email: new FormControl(''),
      pk_userID: new FormControl(0),
      update_smartuser: new FormControl(true)
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.getAdminSmartArts(1, 'get');
  };
  calledScreen(value) {
    this.initForm();
    this.mainScreen = value;
    if (this.mainScreen == 'Current Users') {
      this.dataSource = this.tempDataSource;
      this.page = 1;
      this._changeDetectorRef.markForCheck();
      if (this.dataSource.length == 0) {
        this.getAdminSmartArts(1, 'get');
      }
    } else if (this.mainScreen == 'View Disabled Users') {
      this.disabledDataSource = this.temdisabledDataSource;
      this.disabledPage = 1;
      this._changeDetectorRef.markForCheck();
      if (this.disabledDataSource.length == 0) {
        this.getDisabledAdminSmartArts(1);
      }
    } else {
      this.isAddNewUserLoader = false;
    }
  }
  calledUserScreen(value) {
    this.mainScreenUser = value;
  }
  getAdminSmartArts(page, type) {
    let params = {
      smart_art_users: true,
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
  getDisabledAdminSmartArts(page) {
    let params = {
      bln_active: 0,
      smart_art_users: true,
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
    this.getAdminSmartArts(this.page, 'get');
  };
  getNextDisabledData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.disabledPage++;
    } else {
      this.disabledPage--;
    };
    this.getDisabledAdminSmartArts(this.disabledPage);
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
  searchColor(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.page = 1;
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getAdminSmartArts(1, 'get');
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
    const { username, password, email, firstName, lastName, bln_master, add_smartuser } = this.addNewUserForm.getRawValue();
    if (username == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: AddSmartArtUser = {
      username, password, email, firstName, lastName, bln_master, add_smartuser
    }
    this.isAddNewUserLoader = true;
    this._UsersService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.tempDataSource = [];
        this.getAdminSmartArts(1, 'add');
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
    const { userName, password, email, firstName, lastName, blnActive, pk_userID, blnMaster, update_smartuser } = this.updateUserForm.getRawValue();
    if (userName == '' || password == '' || email == '') {
      this._UsersService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: UpdateSmartUser = {
      userName, password, email, firstName, lastName, update_smartuser, blnActive, pk_userID, blnMaster
    }
    this.isUpdateUserLoader = true;
    this._UsersService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        if (this.updateUserData.blnActive == blnActive) {
          this.updateUserData.firstName = firstName;
          this.updateUserData.lastName = lastName;
          this.updateUserData.blnMaster = blnMaster;
          this.updateUserData.blnActive = blnActive;
          this.updateUserData.pk_userID = pk_userID;
          this.updateUserData.userName = userName;
          this.updateUserData.password = password;
          this.updateUserData.email = email;
        } else {
          if (this.updateUserData.blnActive) {
            this.updateUserData.firstName = firstName;
            this.updateUserData.lastName = lastName;
            this.updateUserData.blnMaster = blnMaster;
            this.updateUserData.blnActive = blnActive;
            this.updateUserData.pk_userID = pk_userID;
            this.updateUserData.userName = userName;
            this.updateUserData.password = password;
            this.updateUserData.email = email;
            this.dataSource = this.dataSource.filter(elem => elem.pk_userID != pk_userID);
            this.totalUsers--;
            this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_userID != pk_userID);
            this.tempRecords--;
            this.disabledDataSource.push(this.updateUserData);
            this.distabledTotalUsers++;
            this.temdisabledDataSource.push(this.updateUserData);
            this.tempdistabledTotalUsers++;
          } else {
            this.updateUserData.firstName = firstName;
            this.updateUserData.lastName = lastName;
            this.updateUserData.blnMaster = blnMaster;
            this.updateUserData.blnActive = blnActive;
            this.updateUserData.pk_userID = pk_userID;
            this.updateUserData.userName = userName;
            this.updateUserData.password = password;
            this.updateUserData.email = email;

            this.disabledDataSource = this.disabledDataSource.filter(elem => elem.pk_userID != pk_userID);
            this.distabledTotalUsers--;
            this.temdisabledDataSource = this.temdisabledDataSource.filter(elem => elem.pk_userID != pk_userID);
            this.tempdistabledTotalUsers--;
            this.dataSource.push(this.updateUserData);
            this.totalUsers++;
            this.tempDataSource.push(this.updateUserData);
            this.tempRecords++;
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
      this.isUpdateUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteUser(item, type) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: RemoveSmartArtUser = {
      user_id: item.pk_userID,
      remove_smartuser: true
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
