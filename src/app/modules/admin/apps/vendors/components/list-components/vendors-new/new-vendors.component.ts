import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddCompany } from '../../vendors.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-new-vendors',
  templateUrl: './new-vendors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class NewVendorsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  allStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  addCompanyForm: FormGroup;
  isAddLoader: boolean = false;

  ngSupplier = true;
  ngDecorator = true;
  ngDigitizer = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _commonService: DashboardsService
  ) { }

  initForm() {
    this.addCompanyForm = new FormGroup({
      companyName: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      zipCode: new FormControl(''),
      phone: new FormControl(''),
      phoneExt: new FormControl(''),
      fax: new FormControl(''),
      ASI: new FormControl(''),
      PPAI: new FormControl(''),
      artworkEmail: new FormControl(''),
      ordersEmail: new FormControl(''),
      websiteURL: new FormControl(''),
      outsideRep: new FormControl(''),
      insideRep: new FormControl(''),
      outsideRepPhone: new FormControl(''),
      outsideRepEmail: new FormControl(''),
      insideRepPhone: new FormControl(''),
      insideRepEmail: new FormControl(''),
      samplesContactEmail: new FormControl(''),
      customerAccountNumber: new FormControl(''),
      companyType: new FormControl([1])
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getStatesObservable();
    let params;
    this.searchStateCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          states: true,
          keyword: res
        }
        return res !== null
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStates = [];
        this.isSearchingState = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingState = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStates = data['data'];
    });
  };

  getStatesObservable() {
    this._vendorService.States$.pipe(takeUntil(this._unsubscribeAll)).subscribe(states => {
      this.allStates = states["data"];
      this.totalStates = states["totalRecords"];
      this.searchStateCtrl.setValue({ state: this.allStates[0].state });
      this.selectedState = this.allStates[0];
    });
  }
  onSelected(ev) {
    this.selectedState = ev.option.value;
  }

  displayWith(value: any) {
    return value?.state;
  }
  onBlur() {
    this.searchStateCtrl.setValue({ state: this.selectedState.state });
  }
  // Create New Company
  addNewCompany() {
    let errorMessage = '';
    const { companyName, address, city, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, customerAccountNumber, phoneExt } = this.addCompanyForm.getRawValue();
    let companyType = [];
    if (this.ngSupplier) {
      companyType.push(1);
    }
    if (this.ngDecorator) {
      companyType.push(2);
    }
    if (this.ngDigitizer) {
      companyType.push(3);
    }

    const trimAndLen = (value: string) => value.trim().length;

    const validateEmail = (email: string) => !email.trim() || this.formVal_email(email);

    const validatePhone = (phone: string, ext: string) => !phone.trim() || this.formVal_phone(phone + ext);

    if (![companyName, address, city, zipCode, phone].every(trimAndLen)) {
      errorMessage = 'Name, address, city, zip, and phone are required.';
    } else if (!this.formVal_zipCode(zipCode)) {
      errorMessage = 'Zip code appears invalid. Enter 5-digit U.S. zip codes only.';
    } else if (!validatePhone(phone, phoneExt)) {
      errorMessage = 'Phone number appears invalid. Enter 10-digit U.S. phone numbers only.';
    } else if (!validatePhone(fax, '')) {
      errorMessage = 'Fax number appears invalid. Enter 10-digit U.S. phone numbers only or leave blank.';
    } else if (!validateEmail(artworkEmail)) {
      errorMessage = 'Graphics email appears non-valid.';
    } else if (!validateEmail(ordersEmail)) {
      errorMessage = 'Orders email appears non-valid.';
    } else if (!validateEmail(outsideRepEmail)) {
      errorMessage = 'The outside rep email you entered does not appear to be valid.';
    } else if (!validateEmail(insideRepEmail)) {
      errorMessage = 'The inside rep email you entered does not appear to be valid.';
    }
    let formattedPhone = '';
    let formattedFax = '';
    if (!errorMessage) {
      formattedPhone = this.format_phone(phone, phoneExt);
      formattedFax = fax.trim() ? this.format_phone(fax, '') : '';
    }
    if (!errorMessage && (!Array.isArray(companyType) || companyType.length === 0 || !companyType.some(type => [1, 2, 3].includes(type)))) {
      errorMessage = 'Please select at least one company type.';
    }


    if (errorMessage) {
      this._vendorService.snackBar(errorMessage);
      return;
    }

    let payload: AddCompany = {
      companyName: companyName.replace(/'/g, "''"), address: address.replace(/'/g, "''"), city: city.replace(/'/g, "''"), zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, companyType, state: this.selectedState.state, customerAccountNumber, create_company: true
    }
    this.isAddLoader = true;
    this._vendorService.postVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._commonService.getSuppliersData().pipe(finalize(() => {
          this._vendorService.snackBar(res["message"]);
          this.isAddLoader = false;
          this.initForm();
          this._changeDetectorRef.markForCheck();
        })).subscribe();
      } else {
        this.isAddLoader = false;
        this._vendorService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isAddLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  formVal_email(email: string): boolean {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }
  formVal_phone(phone: string): boolean {
    // Regular expression for basic 10-digit U.S. phone number validation
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.trim());
  }

  formVal_zipCode(zipCode: string): boolean {
    // Regular expression for basic 5-digit U.S. zip code validation
    const zipCodeRegex = /^\d{5}$/;
    return zipCodeRegex.test(zipCode.trim());
  }
  format_phone(phone: string, extension: string): string {
    // Regular expression for extracting digits from a string
    const digitRegex = /\d/g;

    // Extract only digits from the phone number
    const digits = phone.trim().match(digitRegex)?.join('') || '';

    // Format the phone number as (XXX) XXX-XXXX
    const formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;

    // Append the extension if provided
    return extension.trim() ? `${formattedPhone} ext. ${extension.trim()}` : formattedPhone;
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
