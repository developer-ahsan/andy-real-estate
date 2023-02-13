import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RoyaltyService } from '../../royalities.service';
import { applyBlanketCustomerPercentage, newFLPSUser, newOrderManageUser, removeFLPSUser, RemoveUser, updateFLPSUser, updateOrderManageUser, updateOrderManageUserStores } from '../../royalities.types';
@Component({
  selector: 'app-royality-reports',
  templateUrl: './royality-reports.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class RoyaltyReportsComponent implements OnInit, OnDestroy {
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

  ngReportType = 'c';
  planBillingForm: FormGroup;
  plans: any[];
  storesList = [];
  ngEmployee = 12885;
  ngPlan = 'weekly';
  maxDate = new Date();
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  month = 1;
  currentYear = new Date().getFullYear();
  years = [];

  quarter = 1;
  quarterly = [{
    value: 1,
    text: '1-3'
  },
  {
    value: 2,
    text: '4-6'
  },
  {
    value: 3,
    text: '7-9'
  },
  {
    value: 4,
    text: '10-12'
  }];


  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearching = false;
  minLengthTerm = 3;

  // Report
  WeekDate = new Date();
  monthlyMonth = 1;
  monthlyYear = new Date().getFullYear();
  quarterMonth = 1;
  quarterYear = new Date().getFullYear();
  yearlyYear = new Date().getFullYear();
  ngRangeStart = new Date();
  ngRangeEnd = new Date();

  generateReportLoader: boolean = false;
  isGenerateReport: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _RoyaltyService: RoyaltyService
  ) { }

  initForm() {
    this.plans = [
      {
        value: 'weekly',
        label: 'Weekly',
        details: 'Choose a date.',
        price: '10'
      },
      {
        value: 'monthly',
        label: 'Monthly',
        details: 'Choose month and year.',
        price: '20'
      },
      {
        value: 'quarterly',
        label: 'Quarterly',
        details: 'Generate quarterly report.',
        price: '40'
      },
      {
        value: 'yearly',
        label: 'Yearly',
        details: 'Choose a year.',
        price: '40'
      },
      {
        value: 'range',
        label: 'Range',
        details: 'Generate range report.',
        price: '40'
      }
    ];
    let params;
    this.searchStoreCtrl.valueChanges.pipe(
      filter(res => {
        params = {
          stores_list: true,
          keyword: res
        }
        return res !== null && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        this.storesList = [];
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._RoyaltyService.getCallsData(params)
        .pipe(
          finalize(() => {
            this.isSearching = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.storesList = data['data'];
    });
    this.addNewUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      email: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnFulfillment: new FormControl(false),
      create_order_manage_user: new FormControl(true)
    });
    this.updateUserForm = new FormGroup({
      userName: new FormControl(''),
      password: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      blnFulfillment: new FormControl(false),
      email: new FormControl(''),
      pk_userID: new FormControl(0),
      update_order_manage_user: new FormControl(true)
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.getAdminOrderUsers(1, 'get');
  };
  onSelected(ev) {
    this.selectedStore = ev.option.value;
  }
  displayWith(value: any) {
    return value ? value?.storeName : '';
  }
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
    this._RoyaltyService.getAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddNewUserLoader = false;
        this.initForm();
        this._RoyaltyService.snackBar('User Added Successfully');
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
    if (userName == '' || password == '' || email == '') {
      this._RoyaltyService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: newOrderManageUser = {
      userName, password, email, firstName, lastName, blnFulfillment, create_order_manage_user
    }
    this.isAddNewUserLoader = true;
    this._RoyaltyService.AddAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.tempDataSource = [];
        this.getAdminOrderUsers(1, 'add');
      } else {
        this._RoyaltyService.snackBar(res["message"]);
        this.isAddNewUserLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
      this.isAddNewUserLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateUser() {
    const { userName, password, email, firstName, lastName, pk_userID, blnFulfillment, update_order_manage_user } = this.updateUserForm.getRawValue();
    if (userName == '' || password == '' || email == '') {
      this._RoyaltyService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: updateOrderManageUser = {
      userName, password, email, firstName, lastName, blnFulfillment, update_order_manage_user, pk_userID
    }
    this.isUpdateUserLoader = true;
    this._RoyaltyService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.updateUserData.firstName = firstName;
        this.updateUserData.lastName = lastName;
        this.updateUserData.blnFulfillment = blnFulfillment;
        this.updateUserData.pk_userID = pk_userID;
        this.updateUserData.userName = userName;
        this.updateUserData.password = password;
        this.updateUserData.email = email;
        this.isUpdateUserLoader = false;
        this._RoyaltyService.snackBar('User Updated Successfully');
        this._changeDetectorRef.markForCheck();
      } else {
        this._RoyaltyService.snackBar(res["message"]);
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
    this._RoyaltyService.UpdateAdminsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_userID != item.pk_userID);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_userID != item.pk_userID);
      this.tempRecords--;
      this._RoyaltyService.snackBar('User Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
    });
  }

  getAllStores() {
    this._RoyaltyService.adminStores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    this._RoyaltyService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
    this._RoyaltyService.UpdateAdminsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.updateUserData.storeID = storesList.toString();
      }
      this._RoyaltyService.snackBar(res["message"]);
      this.updateStoreLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
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
