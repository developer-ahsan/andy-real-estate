import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import moment from 'moment';
import { FLPSService } from '../../flps.service';
import { newFLPSUser, updateFLPSUser } from '../../flps.types';
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


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddPromoLoader: boolean = false;

  // Update Color
  isUpdatePromoLoader: boolean = false;
  isUpdatePromo: boolean = false;
  updatePromoData: any;
  ngRGBUpdate = '';


  addPromoForm: FormGroup;
  updatePromoForm: FormGroup;

  employeeUser = [];
  employeeLoader: boolean = false;
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
  getFlpsUsers(page, type) {
    let params = {
      login_check: true,
      bln_active: 1,
      page: page,
      size: 20
    }
    this._flpsService.getFlpsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    console.log(data);
    this.isUpdateUser = check;
    if (check) {
      data.defaultCommission = data.defaultCommission * 100;
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
      this._flpsService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: newFLPSUser = {
      userName, password, email, firstName, lastName, blnAdmin, defaultCommission: defaultCommission / 100, admin_user_id: adminId, new_flps_user
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
      userName, password, email, firstName, lastName, blnAdmin, defaultCommission: defaultCommission / 100, admin_user_id: adminId, update_flps_user, blnActive, user_id: pk_userID
    }
    this.isUpdateUserLoader = true;
    this._flpsService.AddFlpsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.updateUserData.firstName = firstName;
        this.updateUserData.lastName = lastName;
        this.updateUserData.blnAdmin = blnAdmin;
        this.updateUserData.defaultCommission = defaultCommission;
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
  // Delete Promo
  deletePromo(item) {
    item.delLoader = true;
    let payload = {
      promocode: item.promocode,
      delete_promo_code: true
    }
    this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.promocode != item.promocode);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.promocode != item.promocode);
      this.tempRecords--;
      this._flpsService.snackBar('PromoCode Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._flpsService.snackBar('Something went wrong');
    });
  }
  // Update Promo
  updatePromoToggle(item) {
    if (item) {
      this.updatePromoData = item;
      this.updatePromoForm.patchValue(item);
      if (item.expDate != 0) {
        this.updatePromoForm.patchValue({
          expDate: new Date(item.expDate)
        });
      }
    }
    this.isUpdatePromo = !this.isUpdatePromo;
  }
  updatePromoCode() {
    const { promocode, amount, threshold, description, blnActive, expDate, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent } = this.updatePromoForm.getRawValue();
    if (promocode == '' || description == '') {
      this._flpsService.snackBar('Please fill out the required fields');
      return;
    }
    let date;
    if (expDate) {
      date = moment(expDate).format('MM/DD/YYYY');
    } else {
      date = 0;
    }
    let payload = {
      amount, threshold, description, blnActive, expDate: date, blnShipping, blnRemoveShippingCost, blnRemoveShippingPrice, blnRemoveCost, blnRemovePrice, blnPercent, promocode, update_promo_code: true
    }
    this.isUpdatePromoLoader = true;
    this._flpsService.UpdateFlpsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdatePromoLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource.filter(elem => {
        if (elem.promocode == this.updatePromoData.promocode) {
          elem.promocode = promocode;
          elem.amount = amount;
          elem.threshold = threshold;
          elem.description = description;
          elem.blnActive = blnActive;
          elem.expDate = moment(expDate).format('MM/DD/YYYY');
          elem.blnShipping = blnShipping;
          elem.blnPercent = blnPercent;
          elem.blnRemoveShippingCost = blnRemoveShippingCost;
          elem.blnRemoveShippingPrice = blnRemoveShippingPrice;
          elem.blnRemoveCost = blnRemoveCost;
          elem.blnRemovePrice = blnRemovePrice;
        }
      });
      this._flpsService.snackBar('Promo Code Updated Successfully');
      this.isUpdatePromo = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._flpsService.snackBar('Something went wrong');
    })
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
