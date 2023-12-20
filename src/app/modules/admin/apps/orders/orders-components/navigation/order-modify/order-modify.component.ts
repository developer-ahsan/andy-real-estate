import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { addComment, contactInfoObj, paymentInfoObj, shippingDetailsObj } from '../../orders.types';

@Component({
  selector: 'app-order-modify',
  templateUrl: './order-modify.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderModifyComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  mainScreen: string = 'Contact Information';
  currentComments: any;

  dropdownList = [{ id: 1, name: 'ahsan' }, { id: 2, name: 'ahsan1' }];
  dropdownSettings: IDropdownSettings = {};
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  emails = [];
  resultEmails = [];
  public emailControl = new FormControl;
  isEmailLoader: boolean = false;
  emailSelected = [];
  user: any;

  isAddCommentLoader: boolean = false;
  ngComment: string = '';

  billingShippingForm: FormGroup;
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  paymentMethods: any;
  isBillingLoader: boolean = false;
  isShippingLoader: boolean = false;
  isPaymentLoader: boolean = false;
  formattedDate: string;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _authService: AuthService,
    private _snackBar: MatSnackBar
  ) { }

  formInitialization() {
    this.paymentMethods = [
      {
        id: 1,
        name: 'Online Credit Card'
      },
      {
        id: 5,
        name: 'Third Party Payment'
      },
      {
        id: 3,
        name: 'Prepayment'
      },
      {
        id: 4,
        name: 'Credit Terms'
      }
    ]
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
      billingCountry: new FormControl('', Validators.required),
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
      shippingCountry: new FormControl('', Validators.required),
      shippingPhone: new FormControl('', Validators.required),
      shippingEmail: new FormControl('', Validators.required),
      accountChargeCode: new FormControl(''),
      CNumber: new FormControl('')
    });
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
    this.paymentForm = new FormGroup({
      paymentMethodID: new FormControl(''),
      discountCode: new FormControl(''),
      transactionID: new FormControl(''), //misssing in detail object
      discountAmount: new FormControl(''),
      salesTaxRate: new FormControl('', Validators.required),
      taxExemptionComment: new FormControl(''),
      instructions: new FormControl(''),
      blnTaxable: new FormControl()
    });
  }

  ngOnInit(): void {
    this.formInitialization();
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.selectedOrder = res["data"][0];
        if (this.selectedOrder.proofEmail) {
          let emails = this.selectedOrder.proofEmail.split(',');
          this.emails = emails;
        }
        console.log(this.selectedOrder);
        this.billingShippingForm.patchValue(this.selectedOrder);
        this.formattedDate = moment(this.selectedOrder.inHandsDate).format('MMM D YYYY');
        this.shippingForm.patchValue(this.selectedOrder);
        this.paymentForm.patchValue(this.selectedOrder);
        this.paymentForm.patchValue({ salesTaxRate: this.selectedOrder.salesTaxRate * 100 });
      }
    });
  };
  calledScreen(screen) {
    this.mainScreen = screen;
  }
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.emails.push(value);
    }
    event.chipInput!.clear();
  }
  updateContactInformation() {
    if (!this.billingShippingForm.valid) {
      this._orderService.snackBar('Please fill out required fields');
      return;
    }
    this.isBillingLoader = true;
    const { CNumber, billingCompanyName, billingFirstName, billingLastName, billingLocation, billToDeliverTo, billingAddress, billingCity, billingState, billingZip, billingCountry, billingPhone, billingEmail, shippingCompanyName, shippingFirstName, shippingLastName, shippingLocation, shipToDeliverTo, shippingAddress, shippingCity, shippingState, shippingZip, shippingZipExt, shippingCountry, shippingPhone, shippingEmail, accountChargeCode } = this.billingShippingForm.value;
    if (billingCompanyName.trim() === '' || billingFirstName.trim() === '' || billingLastName.trim() === '' ||
      billingAddress.trim() === '' || billingCity.trim() === '' || billingState.trim() === '' ||
      billingZip.trim() === '' || billingCountry.trim() === '' || billingEmail.trim() === '' ||
      shippingCompanyName.trim() === '' || shippingFirstName.trim() === '' || shippingLastName.trim() === '' ||
      shippingAddress.trim() === '' || shippingCity.trim() === '' || shippingState.trim() === '' ||
      shippingZip.trim() === '' || shippingCountry.trim() === '' || shippingEmail.trim() === '') {
      this._orderService.snackBar('Please fill out required fields');
      return;
    }

    let payload: contactInfoObj = {
      order_id: this.selectedOrder.pk_orderID,
      store_id: this.selectedOrder.fk_storeID,
      billing_company_name: billingCompanyName,
      billing_first_name: billingFirstName,
      billing_last_name: billingLastName,
      billing_address: billingAddress,
      billing_city: billingCity,
      billing_state: billingState,
      billing_zip: billingZip,
      billing_country: billingCountry,
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
      shipping_country: shippingCountry,
      shipping_phone: shippingPhone,
      shipping_email: shippingEmail,
      account_charge_code: accountChargeCode,
      proof_email: this.emails.toString(),
      alternate_proof_emails: this.emails,
      billing_location: billingLocation,
      shipping_location: shippingLocation,
      ship_to_deliver_to: shipToDeliverTo,
      bill_to_deliver_to: billToDeliverTo,
      modify_contact_info: true,
      CNumber: CNumber
    };
    this.selectedOrder.proofEmail = this.emails.toString();
    this._orderService.updateOrderCalls(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isBillingLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._orderService.snackBar(res["message"]);
      }
    }, err => {
      // console.log(err);
    });
  }
  updateShippingInformation() {
    if (!this.shippingForm.valid) {
      this._orderService.snackBar('Please fill out required fields');
      return;
    }
    const { inHandsDate, shippingCarrierName, paymentDate, shippingServiceName, purchaseOrderNum, shippingCustomerAcc, invoiceDueDate, shippingServiceCode, costCenterCode } = this.shippingForm.value;
    if (shippingCarrierName.trim() === '' || shippingServiceCode.trim() === '') {
      this._orderService.snackBar('Please fill out required fields');
      return;
    }
    let inhands = '';
    if (inHandsDate) {
      inhands = moment(inHandsDate).format('MM/DD/yyyy');
    }
    let pDate = '';
    if (paymentDate) {
      pDate = moment(paymentDate).format('MM/DD/yyyy');
    }
    let invoice = '';
    if (invoiceDueDate) {
      invoice = moment(invoiceDueDate).format('MM/DD/yyyy');
    }
    this.isShippingLoader = true;
    let payload: shippingDetailsObj = {
      order_id: this.selectedOrder.pk_orderID,
      in_hands_date: inhands,
      payment_date: pDate,
      shipping_carrier_name: shippingCarrierName,
      shipping_service_name: shippingServiceName,
      shipping_customer_account_number: shippingCustomerAcc,
      shipping_service_code: shippingServiceCode,
      purchase_order_num: purchaseOrderNum,
      invoice_due_date: invoice,
      cost_center_code: costCenterCode,
      modify_shipping_details: true
    };
    this._orderService.updateOrderCalls(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isShippingLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._orderService.snackBar(res["message"]);
      }
    }, err => {
      // console.log(err);
    });
  }
  updatePaymentInformation() {
    if (!this.paymentForm.valid) {
      this._orderService.snackBar('Please fill out required fields');
      return;
    }
    const { paymentMethodID, discountCode, transactionID, discountAmount, salesTaxRate, taxExemptionComment, instructions, blnTaxable } = this.paymentForm.value;
    if (salesTaxRate === '' || paymentMethodID === '') {
      this._orderService.snackBar('Please fill out required fields');
      return;
    }

    let paymentName = this.paymentMethods.filter(item => item.id == paymentMethodID);
    let payload: paymentInfoObj = {
      payment_method_id: paymentMethodID,
      payment_method_name: paymentName[0].name,
      gateway_trx_id: transactionID,
      discount_code: discountCode,
      discount_amount: discountAmount,
      sales_tax_rate: salesTaxRate/100,
      tax_exemption_comment: taxExemptionComment,
      instructions: instructions,
      is_taxable: blnTaxable,
      credit_term_id: 0,
      order_id: this.selectedOrder.pk_orderID,
      modify_payment_info: true
    };
    this.isPaymentLoader = true;
    this._orderService.updateOrderCalls(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isPaymentLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._orderService.snackBar(res["message"]);
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

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
