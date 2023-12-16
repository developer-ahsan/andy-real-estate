import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../../quotes.service';
import { Subject } from 'rxjs';
import { updateCartInfo, updateCartShipping } from '../../../quotes.types';
import moment from 'moment';

@Component({
  selector: 'app-quote-order-details',
  templateUrl: './quote-order-details.component.html',
  styles: [".tracker {background-color: #eee;} .tracker-active {background-color: green;color: #fff;} .progress {height: 2rem} ::-webkit-scrollbar {width: 3px !important}"]
})
export class QuoteOrderDetailsComponent implements OnInit {
  shippingForm: FormGroup;
  selectedQuoteDetail: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isBillingLoader: boolean = false;
  isShippingLoader: boolean = false;
  constructor(
    private _quoteService: QuotesService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getQuotesDetails();
  }
  initForm() {
    this.shippingForm = new FormGroup({
      inHandsDate: new FormControl(''),
      shippingCarrierName: new FormControl('', Validators.required),
      paymentDate: new FormControl(''),
      shippingServiceName: new FormControl('', Validators.required),
      purchaseOrderNum: new FormControl(''),
      shippingCustomerAccountNumber: new FormControl(''),
      invoiceDueDate: new FormControl(''),
      shippingServiceCode: new FormControl('', Validators.required),
      costCenterCode: new FormControl('')
    });
  }
  getQuotesDetails() {
    this._quoteService.qoutesDetails$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quote) => {
        this.selectedQuoteDetail = quote["data"][0];
        this.shippingForm.patchValue(this.selectedQuoteDetail);
        this._changeDetectorRef.markForCheck();
      });
  }
  updateShippingInformation() {
    if (!this.shippingForm.valid) {
      this._quoteService.snackBar('Please fill out required fields');
      return;
    }
    const { inHandsDate, shippingCarrierName, paymentDate, shippingServiceName, purchaseOrderNum, shippingCustomerAcc, invoiceDueDate, shippingServiceCode, costCenterCode } = this.shippingForm.value;

    if(shippingCarrierName.trim() === '' || shippingServiceName.trim() === '' || shippingServiceCode.trim() === '') {
      this._quoteService.snackBar('Please fill out required fields');

      return;
    }

    let inhands = '';
    if (inHandsDate) {
      inhands = moment(inHandsDate).format('MM/DD/yyyy');
    }
    let invoice = '';
    if (invoiceDueDate) {
      invoice = moment(invoiceDueDate).format('MM/DD/yyyy');
    }
    this.isShippingLoader = true;
    let payload: updateCartShipping = {
      cart_id: this.selectedQuoteDetail.pk_cartID,
      admin_user_id: 6286,
      in_hands_date: inhands,
      shipping_carrier_name: shippingCarrierName,
      shipping_service_name: shippingServiceName,
      shipping_customer_account_number: shippingCustomerAcc,
      shipping_service_code: shippingServiceCode,
      purchase_order_num: purchaseOrderNum,
      modify_cart_shipping_details: true
    };
    this._quoteService.UpdateQuoteData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isShippingLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
      }
    }, err => {
      // console.log(err);
    });
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
            obj[key] = obj[key]?.replace(/'/g, "''");
        }
    }
    return obj;
}
}
