import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddCompany, UpdateCompany, UpdateWebsiteLoginInfo } from '../../vendors.types';
@Component({
  selector: 'app-vendors-info',
  templateUrl: './vendors-info.component.html',
  styles: ["::ng-deep {.ql-container {height: auto}} .mat-paginator {border-radius: 16px !important}"]
})
export class VendorsInfoComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  allStates = [];
  totalStates = 0;

  searchStateCtrl = new FormControl();
  selectedState: any;
  isSearchingState = false;

  updateCompnayForm: FormGroup;
  isUpdateLoader: boolean = false;

  supplierData: any;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;

  additionalOrderEmails = [];

  websiteData: any = { userName: '', password: '' };
  isWebsiteDataLoad: boolean = false;
  isUpdateWebsiteLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  initForm() {
    this.updateCompnayForm = new FormGroup({
      pk_companyID: new FormControl(''),
      companyName: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      zipCode: new FormControl(''),
      country: new FormControl(''),
      phone: new FormControl(''),
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
      additionalOrderEmails: new FormControl(''),
      vendorRelation: new FormControl(''),
      screenprintEmail: new FormControl(''),
      embroideryEmail: new FormControl(''),
      coopPricing: new FormControl(''),
      netSetup: new FormControl(''),
      phoneExt: new FormControl(''),
      ltm: new FormControl(''),
      freeRandomSamples: new FormControl(''),
      specSamples: new FormControl(''),
      production: new FormControl(''),
      customerAccountNumber: new FormControl(''),
      shippingComment: new FormControl(''),
      notes: new FormControl(''),
      imprintDetails: new FormControl('')
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getVendorsData();
    this.getWebsiteLogin();
    const storedValue = JSON.parse(sessionStorage.getItem('storeStateSupplierData'));
    this.allStates = this.splitData(storedValue.data[2][0].states);
  };

  splitData(data) {
    const dataArray = data.split(",,");
    const result = [];

    dataArray.forEach(item => {
      const [id, state, name, index] = item.split("::");
      result.push({ id: parseInt(id), state, name, index: parseInt(index) });
    });

    return result;
  }

  getWebsiteLogin() {
    this.isWebsiteDataLoad = true;
    let params = {
      website_login: true,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.websiteData.userName = res["data"][0].userName;
        this.websiteData.password = res["data"][0].password;
      }
      this.isWebsiteDataLoad = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isWebsiteDataLoad = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  additionalEmails(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value != '') {
      const index = this.additionalOrderEmails.findIndex(elem => elem == event.value);
      if (index >= 0) {
        this._vendorService.snackBar('Email already listed');
      } else {
        this.additionalOrderEmails.push(event.value);
      }
    }
    event.chipInput!.clear();
  }
  removeAdditionalEmails(email): void {
    const index = this.additionalOrderEmails.findIndex(elem => elem == email);
    if (index >= 0) {
      this.additionalOrderEmails.splice(index, 1);
    }
  }
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.selectedState = this.supplierData.state;
      this.searchStateCtrl.setValue(this.selectedState);
      this.updateCompnayForm.patchValue(this.supplierData);
      if (this.supplierData.additionalOrderEmails) {
        this.additionalOrderEmails = this.supplierData.additionalOrderEmails.split(',');
      }
    })
  }

  onSelected(ev) {
    this.selectedState = ev;
  }

  displayWith(value: any) {
    return value;
  }
  onBlur() {
    this.searchStateCtrl.setValue(this.selectedState);
  }
  // Update New Company
  updateCompany() {
    const { pk_companyID, companyName, address, city, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, additionalOrderEmails, vendorRelation, screenprintEmail, embroideryEmail, coopPricing, netSetup, ltm, freeRandomSamples, specSamples, production, customerAccountNumber, shippingComment, notes, phoneExt, imprintDetails } = this.updateCompnayForm.getRawValue();
    const state = this.selectedState;
    const trimAndLen = (value: string) => value?.trim().length;

    const validateEmail = (email: string) => !email.trim() || this.formVal_email(email);

    const validatePhone = (phone: string, ext: string) => !phone?.trim() || this.formVal_phone(phone + ext);
    let errorMessage = '';
    if (![companyName, address, city, zipCode, phone].every(trimAndLen)) {
      errorMessage = 'Name, address, city, zip, and phone are required.';
    } else if (!this.formVal_zipCode(zipCode)) {
      errorMessage = 'Zip code appears invalid. Enter 5-digit U.S. zip codes only.';
    } else if (!validatePhone(phone, phoneExt)) {
      errorMessage = 'Phone number appears invalid. Enter 10-digit U.S. phone numbers only.';
    } else if (!validatePhone(fax, '')) {
      errorMessage = 'Fax number appears invalid. Enter 10-digit U.S. phone numbers only or leave blank.';
    } else if (artworkEmail) {
      if (!validateEmail(artworkEmail)) {
        errorMessage = 'Graphics email appears non-valid.';
      }
    } else if (ordersEmail) {
      if (!validateEmail(ordersEmail)) {
        errorMessage = 'Orders email appears non-valid.';
      }
    } else if (outsideRepEmail) {
      if (!validateEmail(outsideRepEmail)) {
        errorMessage = 'The outside rep email you entered does not appear to be valid.';
      }
    } else if (insideRepEmail) {
      if (!validateEmail(insideRepEmail)) {
        errorMessage = 'The inside rep email you entered does not appear to be valid.';
      }
    }
    let formattedPhone = '';
    let formattedFax = '';
    if (!errorMessage) {
      formattedPhone = this.format_phone(phone, phoneExt);
      formattedFax = fax?.trim() ? this.format_phone(fax, '') : '';
    }

    if (coopPricing.length > 500 || netSetup.length > 500 || ltm.length > 500 || freeRandomSamples.length > 500 || specSamples.length > 500 || production.length > 500) {
      this._vendorService.snackBar('Max length should be 500');
      return;
    }

    if (notes.length > 5000) {
      this._vendorService.snackBar('Max length should be 5000');
      return;
    }


    if (errorMessage) {
      this._vendorService.snackBar(errorMessage);
      return;
    }

    let payload: UpdateCompany = {
      company_id: pk_companyID, imprintDetails: imprintDetails?.trim()?.replace(/'/g, "''"), companyName: companyName?.replace(/'/g, "''"), address: address?.replace(/'/g, "''"), city: city?.replace(/'/g, "''"), state, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, vendorRelation, screenprintEmail, embroideryEmail, coopPricing: coopPricing?.replace(/'/g, "''"), netSetup: netSetup?.replace(/'/g, "''"), ltm: ltm?.replace(/'/g, "''"), freeRandomSamples: freeRandomSamples?.replace(/'/g, "''"), specSamples: specSamples?.replace(/'/g, "''"), production: production?.replace(/'/g, "''"), update_company: true, additionalOrderEmails: this.additionalOrderEmails.toString(), customerAccountNumber, shippingComment: shippingComment?.replace(/'/g, "''"), notes: notes?.replace(/'/g, "''")
    }
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._vendorService.getVendorsSupplierById(payload.company_id).pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
          this._vendorService.snackBar(res["message"]);
          this.isUpdateLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      } else {
        this.isUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  formVal_email(email: string): boolean {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email?.trim());
    }
    // Regular expression for basic email validation

  }
  formVal_phone(phone: string): boolean {
    // Regular expression for basic 10-digit U.S. phone number validation
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone?.trim());
  }

  formVal_zipCode(zipCode: string): boolean {
    // Regular expression for basic 5-digit U.S. zip code validation
    const zipCodeRegex = /^\d{5}$/;
    return zipCodeRegex.test(zipCode?.trim());
  }
  format_phone(phone: string, extension: string): string {
    // Regular expression for extracting digits from a string
    const digitRegex = /\d/g;

    // Extract only digits from the phone number
    const digits = phone?.trim().match(digitRegex)?.join('') || '';

    // Format the phone number as (XXX) XXX-XXXX
    const formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;

    // Append the extension if provided
    return extension?.trim() ? `${formattedPhone} ext. ${extension?.trim()}` : formattedPhone;
  }
  // Update Website Login
  updateWebsiteData() {
    const { userName, password } = this.websiteData;
    if (userName == '' || password == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }

    let payload: UpdateWebsiteLoginInfo = {
      company_id: this.supplierData.pk_companyID, user_name: userName, password, update_website_login: true
    }
    this.isUpdateWebsiteLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._vendorService.snackBar(res["message"]);
      this.isUpdateWebsiteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateWebsiteLoader = false;
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
