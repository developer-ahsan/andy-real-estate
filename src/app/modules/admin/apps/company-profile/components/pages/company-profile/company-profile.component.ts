import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CompaniesService } from '../../companies.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
})
export class CompanyProfileComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  allStores = [];
  searchStoresCtrl = new FormControl();
  selectedStores: any;
  isSearchingStores = false;

  allStates = [];



  mainScreen = 'Companies List';
  totalData = 0;
  tempRecords = 0;
  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['id', 'store', 'company', 'locations', 'customer', 'transaction', 'sales', 'revenue', 'active'];
  keyword: string = '';
  page = 1;
  ngStatus = 1;

  addCompanyForm: FormGroup;
  isFilterLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _coampnyService: CompaniesService,
    private _commonService: DashboardsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.getStores();
    this.getStates();
    this.isLoading = true;
    this.getCompanies(1, 'get');
  };



  initialize() {
    this.addCompanyForm = new FormGroup({
      companyName: new FormControl('', Validators.required),
      companyWebsite: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('AL', Validators.required),
      zip: new FormControl('', Validators.required),
      APContactName: new FormControl('', Validators.required),
      APEmail: new FormControl('', Validators.required),
      remitEmail: new FormControl('', Validators.required),
      additionalEmail: new FormControl(''),
      creditLimit: new FormControl(0),
      netTerms: new FormControl(''),
      paymentMethod: new FormControl(''),
      blnPORequired: new FormControl(false),
      dateCreated: new FormControl(''),
      storeID: new FormControl(0),
      blnSalesTaxExempt: new FormControl(0),
      phone: new FormControl(''),
    });
  }
  calledScreen(screen) {
    this.mainScreen = screen;
  }
  getStores() {
    this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStores.push({ pk_storeID: 0, storeName: 'All Stores' });
      const stores = res["data"].filter(store => store.blnActive);
      this.allStores = this.allStores.concat(stores);
      this.selectedStores = this.allStores[0];
      this.searchStoresCtrl.setValue(this.selectedStores);
    });
  }
  getStates() {
    this._coampnyService.States$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStates = res["data"];
    });
  }
  getCompanies(page, type) {
    if (page == 1) {
      this.isFilterLoader = true;
    }
    let params = {
      company_profiles: true,
      keyword: this.keyword,
      bln_active: this.ngStatus,
      store_id: this.selectedStores.pk_storeID,
      // pk_companyProfileID,
      page: page,
      size: 20
    }
    this._coampnyService.getAPIData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalData = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      if (type == 'add') {
        // this.isAddCoreLoader = false;
        // this.ngName = '';
        // this.coreListCategories = [];
        // this.ngCoreSelect = 0;
        // this.ngCoreCheck = false;
        // this._systemService.snackBar('New Core Added Successfully');
        // this.mainScreen = 'Current Core Product Lists';
      }
      this.isLoading = false;
      this.isFilterLoader = false;
      // this.isSearching = false;
      // this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      // this.isSearching = false;
      this.isLoading = false;
      this.isFilterLoader = false;
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
    this.getCompanies(this.page, 'get');
  };
  onSelectedStores(ev) {
    this.selectedStores = ev.option.value;
  }
  displayWithStores(value: any) {
    return value?.storeName;
  }

  navigateToUpdate(data: any) {
    this.router.navigateByUrl(`/apps/companies/company-profile-update/${data.pk_companyProfileID}/${data.fk_storeID}`);
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
