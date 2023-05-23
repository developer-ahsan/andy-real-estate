import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, Observable } from 'rxjs';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StepperOrientation } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

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
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  displayedColumns: string[] = ['storeName', 'signature', 'dateModified'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataLength: number;
  private fetchCreditApplications: Subscription;
  credit_applications = [];
  credit_applications_length: number;
  isUpdateCreditApplication = false;
  breakpoint: number;
  selectedCreditApplication: null;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  stepperOrientation: Observable<StepperOrientation>;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    breakpointObserver: BreakpointObserver
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 880px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 620) ? 1 : (window.innerWidth <= 880) ? 2 : 3;

    this.firstFormGroup = this._formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      title: ['', Validators.required],
      businessName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
      website: ['', Validators.required],
      taxId: ['', Validators.required],
      amount: ['', Validators.required],
      dbNumber: ['', Validators.required]
    });

    this.secondFormGroup = this._formBuilder.group({
      businessType: ['', Validators.required],
      businessSince: ['', Validators.required],
      legalForm: ['', Validators.required],
      parentCompany: ['', Validators.required],
      parentBusinessSince: ['', Validators.required],
      authorizedBuyer: ['', Validators.required],
      authorizedBuyerTitle: ['', Validators.required],
      authorizedBuyerEmail: ['', Validators.required],
      authorizedBuyerPhone: ['', Validators.required],
      billingContactName: ['', Validators.required],
      billingContactEmail: ['', Validators.required],
      billingContactPhone: ['', Validators.required]
    });

    this.thirdFormGroup = this._formBuilder.group({
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      bankContactName: ['', Validators.required],
      bankContactPhone: ['', Validators.required]
    });

    this.fourthFormGroup = this._formBuilder.group({
      tradeCompanyName1: ['', Validators.required],
      tradeContactName1: ['', Validators.required],
      tradeAddress1: ['', Validators.required],
      tradeEmail1: ['', Validators.required],
      tradePhone1: ['', Validators.required],
      tradeCreditLimit1: ['', Validators.required],
      tradeCurrentBalance1: ['', Validators.required]
    });

    const { pk_userID } = this.currentSelectedCustomer;
    this.fetchCreditApplications = this._customerService.getCreditApplications(pk_userID)
      .subscribe((applications) => {
        this.credit_applications = applications["data"];
        this.credit_applications_length = this.credit_applications.length;
        this.isLoadingChange.emit(false);
      });
  }

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
    this.fetchCreditApplications.unsubscribe();
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
      tradeCurrentBalance1: row.tradeCurrentBalance1
    })
  }

  updateCreditApplication() {
  }

  approveCreditApplication() {
  }
}
