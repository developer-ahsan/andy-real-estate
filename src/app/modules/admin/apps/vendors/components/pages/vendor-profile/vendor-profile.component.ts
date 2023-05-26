import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddCompany, UpdateAccountingProfile, UpdateCompany, UpdateWebsiteLoginInfo } from '../../vendors.types';
@Component({
  selector: 'app-vendor-profile',
  templateUrl: './vendor-profile.component.html',
  styles: ["::ng-deep {.ql-container {height: auto}} .mat-paginator {border-radius: 16px !important}"]
})
export class VendorsProfileComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  // @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  updateProfileForm: FormGroup;
  isUpdateLoader: boolean = false;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  addOnBlur = true;

  additionalOrderEmails = [];
  supplierData: any;
  isUpdateProfileLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  initForm() {
    this.updateProfileForm = new FormGroup({
      APContactName: new FormControl(''),
      APEmail: new FormControl(''),
      remitEmailAddress: new FormControl(''),
      additionalEmail: new FormControl(''),
      netTerms: new FormControl('0'),
      creditLimit: new FormControl(''),
      paymentMethod: new FormControl('0')
    });
  }
  ngOnInit(): void {
    this.initForm();
    this.getVendorsData();
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getVendorsProfile();
    });
  }
  getVendorsProfile() {
    this.isLoading = true;
    let params = {
      vendor_accounting_profile: true,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.additionalOrderEmails = res["data"][0]?.additionalEmail?.split(',');
        this.updateProfileForm.patchValue(res["data"][0]);
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
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
  // Update New Company
  UpdateAccountingProfile() {
    this.isUpdateProfileLoader = true;
    const { APContactName, APEmail, remitEmailAddress, additionalEmail, netTerms, creditLimit, paymentMethod } = this.updateProfileForm.getRawValue();
    let payload: UpdateAccountingProfile = {
      APContactName, APEmail, remitEmailAddress, additionalEmail: this.additionalOrderEmails.toString(), netTerms, creditLimit, paymentMethod,
      fk_companyID: this.supplierData.pk_companyID,
      update_vendor_profile: true
    }
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._vendorService.snackBar(res["message"]);
      this.isUpdateProfileLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateProfileLoader = false;
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
