import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { RoyaltyService } from '../../royalities.service';
import { AddSmartArtUser, applyBlanketCustomerPercentage, createLicensingCompany, deleteLicensingCompany, newFLPSUser, removeFLPSUser, RemoveLicensingTerm, RemoveSmartArtUser, updateFLPSUser, updateLicensingCompany, UpdateLicensingTerm, updateSmartArtUsers, UpdateSmartUser } from '../../royalities.types';
@Component({
  selector: 'app-licensing-companies',
  templateUrl: './licensing-companies.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class LicensingCompaniesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'action'];
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

  ngAddCompanyName = '';
  isAddNewCompanyLoader: boolean = false;
  isUpdateCompanyLoader: boolean = false;

  isUpdateLicensingLoader: boolean = false;
  isUpdateLicensing: boolean = false;

  isCompanyTermLoader: boolean = false;
  companytermData: any;
  totalterms = 0;

  not_available = 'N/A';

  mainScreen: string = 'Edit Company';



  isSearching: boolean = false;
  // Emplyees Dropdown
  employeeUser = [];
  isActive: boolean = false;

  // Active Stores
  allStores = [];
  storePage = 1;
  storeLoader: boolean = false;
  totalStores = 0;
  updateStoreLoader: boolean;
  updateCompanyData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _RoyaltyService: RoyaltyService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getLicensingCompanies(1, 'get');
  };
  calledTermScreen(value) {
    this.mainScreen = value;
  }
  getLicensingCompanies(page, type) {
    let params = {
      licensing_companies: true,
      page: page,
      size: 20
    }
    this._RoyaltyService.getCallsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.tempDataSource.length == 0) {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        this.isAddNewCompanyLoader = false;
        this.ngAddCompanyName = '';
        this._RoyaltyService.snackBar('Licensing Company Added Successfully');
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
    this.getLicensingCompanies(this.page, 'get');
  };

  toggleUpdateCompanyData(data, check) {
    this.isUpdateLicensing = check;
    if (check) {
      this.mainScreen = 'Edit Company';
      this.updateCompanyData = data;
      this.getCompanyTerms();
    }
  }

  addNewLicense() {
    if (this.ngAddCompanyName == '') {
      this._RoyaltyService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: createLicensingCompany = {
      name: this.ngAddCompanyName,
      create_licensing_company: true
    }
    this.isAddNewCompanyLoader = true;
    this._RoyaltyService.PostCallsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.page = 1;
        this.paginator.pageIndex = 0;
        this.tempDataSource = [];
        this.getLicensingCompanies(1, 'add');
      } else {
        this._RoyaltyService.snackBar(res["message"]);
        this.isAddNewCompanyLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddNewCompanyLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateLicensingCompany(item) {
    if (item.name == '') {
      this._RoyaltyService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: updateLicensingCompany = {
      licensing_id: item.pk_licensingCompanyID,
      name: item.name,
      update_licensing_company: true
    }
    item.companyLoader = true;
    this._RoyaltyService.PutCallsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.companyLoader = false;
      this._RoyaltyService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.companyLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteCompany(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: deleteLicensingCompany = {
      licensing_id: item.pk_licensingCompanyID,
      delete_licensing_company: true
    }
    this._RoyaltyService.PutCallsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.dataSource = this.dataSource.filter(elem => elem.pk_licensingCompanyID != item.pk_licensingCompanyID);
      this.totalUsers--;
      this.tempDataSource = this.tempDataSource.filter(elem => elem.pk_licensingCompanyID != item.pk_licensingCompanyID);
      this.tempRecords--;
      this._RoyaltyService.snackBar('Licesing Company Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
    });
  }

  getCompanyTerms() {
    let params = {
      licensing_terms: true,
      licensing_company_id: this.updateCompanyData.pk_licensingCompanyID
    }
    this.isCompanyTermLoader = true;
    this._RoyaltyService.getCallsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.companytermData = res["data"];
      this.totalterms = res["totalRecords"];
      this.isCompanyTermLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCompanyTermLoader = false;
      this._changeDetectorRef.markForCheck();
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
