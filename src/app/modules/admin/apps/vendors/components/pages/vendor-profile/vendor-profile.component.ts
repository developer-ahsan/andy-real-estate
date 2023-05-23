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
  };
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
  updateCompany() {
    const { pk_companyID, companyName, address, city, state, zipCode, phone, fax, ASI, PPAI, artworkEmail, ordersEmail, websiteURL, outsideRep, insideRep, outsideRepPhone, outsideRepEmail, insideRepPhone, insideRepEmail, samplesContactEmail, additionalOrderEmails, vendorRelation, screenprintEmail, embroideryEmail, coopPricing, netSetup, ltm, freeRandomSamples, specSamples, production } = this.updateProfileForm.getRawValue();
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

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
