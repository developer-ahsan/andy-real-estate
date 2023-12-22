import { Component, Input, OnInit, Output, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StepperOrientation } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { ApproveCreditApplication, updateCreditApplication } from '../../orders.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

export interface PeriodicElement {
  store: string;
  signed_by: string;
  last_modified: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { store: "MySummaShop.com", signed_by: 'Bill Harris', last_modified: '05/01/2018 @ 04:23:00 PM' }
];

@Component({
  selector: 'app-credit-applications',
  templateUrl: './credit-applications.component.html'
})
export class CreditApplicationsComponent implements OnInit {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['storeName', 'signature', 'dateModified'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataLength: number;
  private fetchCreditApplications: Subscription;
  credit_applications = [];
  credit_applications_length: number;
  isUpdateCreditApplication = false;
  breakpoint: number;
  selectedCreditApplication: any;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  stepperOrientation: Observable<StepperOrientation>;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];


  page = 1;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  isApproveLoader: boolean = false;
  isUpdateLoader: boolean = false;

  allStates: any;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService,
    breakpointObserver: BreakpointObserver
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 880px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit(): void {
    const storedValue = JSON.parse(sessionStorage.getItem('storeStateSupplierData'));
    this.allStates = this.splitData(storedValue.data[2][0].states);
    this.breakpoint = (window.innerWidth <= 620) ? 1 : (window.innerWidth <= 880) ? 2 : 3;

    this.firstFormGroup = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: [''],
      businessName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      phone: [''],
      website: ['', Validators.required],
      taxId: ['', Validators.required],
      amount: ['', Validators.required],
      dbNumber: ['', Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      businessType: [''],
      businessSince: [''],
      legalForm: [''],
      parentCompany: [''],
      parentBusinessSince: [''],
      authorizedBuyer: ['', Validators.required],
      authorizedBuyerTitle: [''],
      authorizedBuyerEmail: ['', [Validators.required, Validators.email]],
      authorizedBuyerPhone: [''],
      billingContactName: ['', Validators.required],
      billingContactEmail: ['', [Validators.required, Validators.email]],
      billingContactPhone: ['']
    });

    this.thirdFormGroup = this._formBuilder.group({
      bankName: [''],
      branchName: [''],
      bankContactName: [''],
      bankContactPhone: ['']
    });

    this.fourthFormGroup = this._formBuilder.group({
      tradeCompanyName1: [''],
      tradeContactName1: [''],
      tradeAddress1: [''],
      tradeEmail1: [''],
      tradePhone1: [''],
      tradeCreditLimit1: [''],
      tradeCurrentBalance1: [''],
      tradeCompanyName2: [''],
      tradeContactName2: [''],
      tradeAddress2: [''],
      tradeEmail2: [''],
      tradePhone2: [''],
      tradeCreditLimit2: [''],
      tradeCurrentBalance2: [''],
      tradeCompanyName3: [''],
      tradeContactName3: [''],
      tradeAddress3: [''],
      tradeEmail3: [''],
      tradePhone3: [''],
      tradeCreditLimit3: [''],
      tradeCurrentBalance3: ['']
    });
    this.isLoading = true;
    this.getCustomer();
  }
  splitData(data) {
    const dataArray = data.split(",,");
    const result = [];

    dataArray.forEach(item => {
      const [id, state, name, index] = item.split("::");
      result.push({ id: parseInt(id), state, name, index: parseInt(index) });
    });

    return result;
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getCreditApplications(1);
      });
  }
  getCreditApplications(page) {
    let params = {
      credit_application: true,
      user_id: this.selectedCustomer.pk_userID,
      size: 10,
      page: page
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(applications => {
      this.credit_applications = applications["data"];
      this.credit_applications_length = this.credit_applications.length;
    }, err => {
      this.isLoading = false;
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
    this.getCreditApplications(this.page);
  };

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 620) ? 1 : (event.target.innerWidth <= 880) ? 2 : 3;
  }

  creditApplicationUpdateToggler() {
    this.isUpdateCreditApplication = !this.isUpdateCreditApplication;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy(): void {
    // this.fetchCreditApplications.unsubscribe();
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onRowClick(row) {
    this.creditApplicationUpdateToggler();
    this.selectedCreditApplication = row;
    this.firstFormGroup.setValue({
      firstName: row.firstName,
      lastName: row.lastName,
      title: row.title,
      businessName: row.company,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      website: row.website,
      taxId: row.taxNumber,
      amount: row.amountRequested,
      dbNumber: row.taxNumber
    })

    this.secondFormGroup.setValue({
      businessType: row.businessType,
      businessSince: row.businessSince,
      legalForm: row.legalForm,
      parentCompany: row.parentCompany,
      parentBusinessSince: row.parentBusinessSince,
      authorizedBuyer: row.authorizedBuyer,
      authorizedBuyerTitle: row.authorizedBuyerTitle,
      authorizedBuyerEmail: row.authorizedBuyerEmail,
      authorizedBuyerPhone: row.authorizedBuyerPhone,
      billingContactName: row.billingContactName,
      billingContactEmail: row.billingContactEmail,
      billingContactPhone: row.billingContactPhone
    })

    this.thirdFormGroup.setValue({
      bankName: row.bankName,
      branchName: row.branchName,
      bankContactName: row.bankContactName,
      bankContactPhone: row.bankContactPhone
    })

    this.fourthFormGroup.setValue({
      tradeCompanyName1: row.tradeCompanyName1,
      tradeContactName1: row.tradeContactName1,
      tradeAddress1: row.tradeAddress1,
      tradeEmail1: row.tradeEmail1,
      tradePhone1: row.tradePhone1,
      tradeCreditLimit1: row.tradeCreditLimit1,
      tradeCurrentBalance1: row.tradeCurrentBalance1,
      tradeCompanyName2: row.tradeCompanyName2,
      tradeContactName2: row.tradeContactName2,
      tradeAddress2: row.tradeAddress2,
      tradeEmail2: row.tradeEmail2,
      tradePhone2: row.tradePhone2,
      tradeCreditLimit2: row.tradeCreditLimit2,
      tradeCurrentBalance2: row.tradeCurrentBalance2,
      tradeCompanyName3: row.tradeCompanyName3,
      tradeContactName3: row.tradeContactName3,
      tradeAddress3: row.tradeAddress3,
      tradeEmail3: row.tradeEmail3,
      tradePhone3: row.tradePhone3,
      tradeCreditLimit3: row.tradeCreditLimit3,
      tradeCurrentBalance3: row.tradeCurrentBalance3
    });
  }

  updateCreditApplication() {
    const { firstName, lastName, title, businessName, address, city, state, zip, phone, website, taxId, amount, dbNumber } = this.firstFormGroup.getRawValue();
    const { businessType, businessSince, legalForm, parentCompany, parentBusinessSince, authorizedBuyer, authorizedBuyerTitle, authorizedBuyerEmail, authorizedBuyerPhone, billingContactName, billingContactEmail, billingContactPhone } = this.secondFormGroup.getRawValue();
    const { bankName, branchName, bankContactName, bankContactPhone } = this.thirdFormGroup.getRawValue();
    const { tradeCompanyName1, tradeContactName1, tradeAddress1, tradeEmail1, tradePhone1, tradeCreditLimit1, tradeCurrentBalance1, tradeCompanyName2, tradeContactName2, tradeAddress2, tradeEmail2, tradePhone2, tradeCreditLimit2, tradeCurrentBalance2, tradeCompanyName3, tradeContactName3, tradeAddress3, tradeEmail3, tradePhone3, tradeCreditLimit3, tradeCurrentBalance3 } = this.fourthFormGroup.getRawValue();
    const userData = JSON.parse(localStorage.getItem('userDetails'));
    let payload: updateCreditApplication = {
      userID: this.selectedCustomer.pk_userID,
      storeID: this.selectedCreditApplication.fk_storeID,
      storeName: this.selectedCreditApplication.storeName,
      adminLoginCompanyName: userData.companyName,
      storeUserName: this.selectedCreditApplication.storeUserName,
      storeUserCompanyName: this.selectedCustomer.companyName,
      firstName,
      lastName,
      title,
      company: businessName,
      address,
      city,
      state,
      zip,
      phone,
      taxNumber: taxId,
      website,
      amountRequested: amount,
      dbNumber,
      businessType,
      businessSince,
      legalForm,
      parentCompany,
      parentBusinessSince,
      authorizedBuyer,
      authorizedBuyerTitle,
      authorizedBuyerEmail,
      authorizedBuyerPhone,
      billingContactName,
      billingContactEmail,
      billingContactPhone,
      bankName,
      branchName,
      bankContactName,
      bankContactPhone,
      tradeCompanyName1,
      tradeContactName1,
      tradeAddress1,
      tradeEmail1,
      tradePhone1,
      tradeCreditLimit1,
      tradeCurrentBalance1,
      tradeCompanyName2,
      tradeContactName2,
      tradeAddress2,
      tradeEmail2,
      tradePhone2,
      tradeCreditLimit2,
      tradeCurrentBalance2,
      tradeCompanyName3,
      tradeContactName3,
      tradeAddress3,
      tradeEmail3,
      tradePhone3,
      tradeCreditLimit3,
      tradeCurrentBalance3,
      signature: this.selectedCreditApplication.signature,
      blnNotify: false,
      update_credit_application: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    payload = this._commonService.replaceNullSpaces(payload);

    if (payload.firstName == '' || payload.lastName == '' || payload.company == '' || payload.address == '' || payload.city == '' || payload.state == '' || payload.zip == '' || payload.website == '' || payload.taxNumber == '' || payload.amountRequested == '' || payload.dbNumber == '') {
      this._commonService.snackBar('Please fill out the required fields');
      return;
    }
    if (payload.authorizedBuyer == '' || payload.authorizedBuyerEmail == '' || payload.billingContactEmail == '') {
      this._commonService.snackBar('Please fill out the required fields');
      return;
    }

    if (!this._commonService.isValidEmail(payload.tradeEmail1) || !this._commonService.isValidEmail(payload.tradeEmail2) || !this._commonService.isValidEmail(payload.tradeEmail3) || !this._commonService.isValidEmail(payload.billingContactEmail) || !this._commonService.isValidEmail(payload.authorizedBuyerEmail)) {
      this._commonService.snackBar('Please check your email addresses');
      return;
    }

    this.isUpdateLoader = true;
    this._customerService.PutApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._commonService.snackBar(res["message"]);
    });


  }

  showConfirmation(message: string, callback: (confirmed: boolean) => void) {
    const result = window.confirm(message);
    callback(result);
  }

  approveCreditApplication() {
    this.showConfirmation('Are you sure you want to approve this credit application?', (confirmed) => {
      if (confirmed) {
        this.isApproveLoader = true;
        let payload: ApproveCreditApplication = {
          userID: this.selectedCustomer.pk_userID,
          storeID: this.selectedCreditApplication.fk_storeID,
          approve_credit_application: true
        }
        this._customerService.PostApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isApproveLoader = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(res => {
          if (res["success"]) {
            this._customerService.snackBar(res["message"]);
          }
        }, err => {
          this.isApproveLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      }
    });
  }
}
