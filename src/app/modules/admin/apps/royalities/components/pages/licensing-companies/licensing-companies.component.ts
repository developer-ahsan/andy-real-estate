import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { RoyaltyService } from '../../royalities.service';
import { AddSmartArtUser, AddSubCategory, applyBlanketCustomerPercentage, createLicensingCompany, CreateLicensingTerm, deleteLicensingCompany, DeleteSubCategories, newFLPSUser, removeFLPSUser, RemoveLicensingTerm, RemoveSmartArtUser, updateFLPSUser, updateLicensingCompany, UpdateLicensingTerm, updateSmartArtUsers, UpdateSmartUser, UpdateSubCategories } from '../../royalities.types';
@Component({
  selector: 'app-licensing-companies',
  templateUrl: './licensing-companies.component.html',
  styles: [".mat-paginator {border-radius: 16px !important} .form-control:focus {border-color: #475569;box-shadow: 0 0 0 0;}"]
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
  companyTermsPage = 1;
  isLoadMore: boolean = false;

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

  // Terms
  ngAddTermName = '';
  ngAddTermCatName = '';
  isAddNewTermLoader: boolean = false;
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
      this.getCompanyTerms(1, 'get');
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

  getCompanyTerms(page, type) {
    let params = {
      licensing_terms: true,
      licensing_company_id: this.updateCompanyData.pk_licensingCompanyID,
      page: page,
      size: 20
    }
    if (type == 'get' && this.companyTermsPage == 1) {
      this.isCompanyTermLoader = true;
    }
    if (this.companyTermsPage == 1) {
      this.companytermData = [];
    }
    this._RoyaltyService.getCallsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.subCategories = JSON.parse(element.subCategories);
        this.companytermData.push(element);
      });
      this.totalterms = res["totalRecords"];
      if (type == 'add') {
        this.isAddNewTermLoader = false;
        this._changeDetectorRef.markForCheck();
        this._RoyaltyService.snackBar('Licensing term added successfully');
        this.ngAddTermName = '';
      }
      this.isLoadMore = false;
      this.isCompanyTermLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadMore = false;
      this.isCompanyTermLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  nextCompanyterms() {
    this.companyTermsPage++;
    this.isLoadMore = true;
    this.getCompanyTerms(this.companyTermsPage, 'get');
  }
  addNewLicenseTerm() {
    if (this.ngAddTermName == '') {
      this._RoyaltyService.snackBar('Please fill out the required fields');
      return;
    }
    let payload: CreateLicensingTerm = {
      term: this.ngAddTermName,
      company_id: this.updateCompanyData.pk_licensingCompanyID,
      create_term: true
    }
    this.isAddNewTermLoader = true;
    this._RoyaltyService.PostCallsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getCompanyTerms(1, 'add');
      } else {
        this._RoyaltyService.snackBar(res["message"]);
        this.isAddNewTermLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddNewTermLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteTerm(item) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: RemoveLicensingTerm = {
      term_id: item.pk_licensingTermID,
      remove_term: true
    }
    this._RoyaltyService.PutCallsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.companytermData = this.companytermData.filter(elem => elem.pk_licensingTermID != item.pk_licensingTermID);
      this._RoyaltyService.snackBar('Licesing Term Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
    });
  }
  updateTerm(item) {
    item.updateLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: UpdateLicensingTerm = {
      term_id: item.pk_licensingTermID,
      term: item.term,
      code: item.code,
      update_term: true
    }
    this._RoyaltyService.PutCallsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.updateLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._RoyaltyService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
    });
  }
  updateSubcategories(item) {
    let subCategories = [];
    item.subCategories.forEach(element => {
      subCategories.push(
        { sub_category_id: element.pk_licensingTermSubCategoryID, name: element.name, code: element.code }
      )
    });
    item.updateCatLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: UpdateSubCategories = {
      licensing_term_id: item.pk_licensingTermID,
      sub_categories: subCategories,
      update_subCategories: true
    }
    this._RoyaltyService.PutCallsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.updateCatLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._RoyaltyService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
    });
  }
  deleteTermCat(item, term) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: DeleteSubCategories = {
      subCategory_id: item.pk_licensingTermSubCategoryID,
      delete_subcategories: true
    }
    this._RoyaltyService.PutCallsData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.delLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      term.subCategories = term.subCategories.filter(elem => elem.pk_licensingTermSubCategoryID != item.pk_licensingTermSubCategoryID);
      this._RoyaltyService.snackBar('Licesing Term Deleted Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._RoyaltyService.snackBar('Something went wrong');
    });
  }
  addNewTermCat(item) {
    if (this.ngAddTermCatName == '') {
      this._RoyaltyService.snackBar('Please fill out the required fields');
      return;
    }
    item.addCatLoader = true;
    let payload: AddSubCategory = {
      licensing_term_id: item.pk_licensingTermID,
      name: this.ngAddTermCatName,
      add_subCategory: true
    }
    this._RoyaltyService.PostCallsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.addCatLoader = false;
      this.ngAddTermCatName = '';
      this._RoyaltyService.snackBar(res["message"]);
      item.subCategories.push({ code: '1', name: payload.name, pk_licensingTermSubCategoryID: res["new_id"] });
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.addCatLoader = false;
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
