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
      ltm: new FormControl(''),
      freeRandomSamples: new FormControl(''),
      specSamples: new FormControl(''),
      production: new FormControl('')
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getStatesObservable();
    this.getVendorsData();
    this.getWebsiteLogin();
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
  getStatesObservable() {
    this._vendorService.States$.pipe(takeUntil(this._unsubscribeAll)).subscribe(states => {
      this.allStates = states["data"];
      this.totalStates = states["totalRecords"];
    });
  }
  onSelected(ev) {
    this.selectedState = ev.option.value;
  }

  displayWith(value: any) {
    return value;
  }
  onBlur() {
    this.searchStateCtrl.setValue(this.selectedState);
  }
  // Update New Company
  updateCompany() {
    const { pk_companyID, companyName, address, city, state, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, additionalOrderEmails, vendorRelation, screenprintEmail, embroideryEmail, coopPricing, netSetup, ltm, freeRandomSamples, specSamples, production } = this.updateCompnayForm.getRawValue();
    if (companyName == '' || address == '' || city == '' || phone == '' || zipCode == '') {
      this._vendorService.snackBar('Please fill out the required fields');
      return;
    }

    let payload: UpdateCompany = {
      company_id: pk_companyID, companyName, address, city, state, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, vendorRelation, screenprintEmail, embroideryEmail, coopPricing, netSetup, ltm, freeRandomSamples, specSamples, production, update_company: true, additionalOrderEmails: this.additionalOrderEmails.toString()
    }
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._vendorService.snackBar(res["message"]);
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
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
