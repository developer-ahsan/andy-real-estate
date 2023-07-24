import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../../quotes.service';
import { Subject } from 'rxjs';
import { updateCartInfo } from '../../../quotes.types';

@Component({
  selector: 'app-quote-contact-info',
  templateUrl: './quote-contact-info.component.html',
  styleUrls: []
})
export class QuoteContactInfoComponent implements OnInit {
  billingShippingForm: FormGroup;
  selectedQuoteDetail: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isBillingLoader: boolean = false;
  constructor(
    private _quoteService: QuotesService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getQuotesDetails();
  }
  initForm() {
    this.billingShippingForm = new FormGroup({
      billingCompanyName: new FormControl('', Validators.required),
      billingFirstName: new FormControl('', Validators.required),
      billingLastName: new FormControl('', Validators.required),
      billingLocation: new FormControl(''),
      billToDeliverTo: new FormControl(''),
      billingAddress: new FormControl('', Validators.required),
      billingCity: new FormControl('', Validators.required),
      billingState: new FormControl('', Validators.required),
      billingZip: new FormControl('', Validators.required),
      billingCountry: new FormControl(''),
      billingPhone: new FormControl('', Validators.required),
      billingEmail: new FormControl('', Validators.required),
      shippingCompanyName: new FormControl('', Validators.required),
      shippingFirstName: new FormControl('', Validators.required),
      shippingLastName: new FormControl('', Validators.required),
      shippingLocation: new FormControl(''),
      shipToDeliverTo: new FormControl(''),
      shippingAddress: new FormControl('', Validators.required),
      shippingCity: new FormControl('', Validators.required),
      shippingState: new FormControl('', Validators.required),
      shippingZip: new FormControl('', Validators.required),
      shippingZipExt: new FormControl(''),
      shippingCountry: new FormControl(''),
      shippingPhone: new FormControl('', Validators.required),
      shippingEmail: new FormControl('', Validators.required),
      accountChargeCode: new FormControl('')
    });
  }
  getQuotesDetails() {
    this._quoteService.qoutesDetails$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quote) => {
        this.selectedQuoteDetail = quote["data"][0];
        console.log(this.selectedQuoteDetail);
        this.billingShippingForm.patchValue(this.selectedQuoteDetail);
        this._changeDetectorRef.markForCheck();
      });
  }
  updateContactInformation() {
    if (!this.billingShippingForm.valid) {
      this._quoteService.snackBar('Please fill out required fields');
      return;
    }
    this.isBillingLoader = true;
    const { billingCompanyName, billingFirstName, billingLastName, billingLocation, billToDeliverTo, billingAddress, billingCity, billingState, billingZip, billingCountry, billingPhone, billingEmail, shippingCompanyName, shippingFirstName, shippingLastName, shippingLocation, shipToDeliverTo, shippingAddress, shippingCity, shippingState, shippingZip, shippingZipExt, shippingCountry, shippingPhone, shippingEmail, accountChargeCode } = this.billingShippingForm.value;
    let payload: updateCartInfo = {
      cart_id: this.selectedQuoteDetail.pk_cartID,
      store_id: this.selectedQuoteDetail.storeID,
      admin_user_id: 6286,
      billing_company_name: billingCompanyName,
      billing_first_name: billingFirstName,
      billing_last_name: billingLastName,
      billing_address: billingAddress,
      billing_city: billingCity,
      billing_state: billingState,
      billing_zip: billingZip,
      billing_phone: billingPhone,
      billing_email: billingEmail,
      shipping_company_name: shippingCompanyName,
      shipping_first_name: shippingFirstName,
      shipping_last_name: shippingLastName,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_state: shippingState,
      shipping_zip: shippingZip,
      shipping_zip_ext: shippingZipExt,
      shipping_phone: shippingPhone,
      shipping_email: shippingEmail,
      account_charge_code: accountChargeCode,
      billing_location: billingLocation,
      shipping_location: shippingLocation,
      ship_to_deliver_to: shipToDeliverTo,
      bill_to_deliver_to: billToDeliverTo,
      alternate_proof_emails: [],
      modify_cart_contact_information: true
    };
    this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isBillingLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
      }
    }, err => {
      // console.log(err);
    });
  }
}
