import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { StripePayment } from '../../orders.types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StripeService, StripeCardComponent } from "ngx-stripe";
import Stripe from "stripe";
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';

@Component({
  selector: 'app-order-payments-bill',
  templateUrl: './order-payments-bill.component.html'
})
export class OrderPaymentBillComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  orderDetail: any;
  not_available_price: string = '0';
  isPaymentLoader: boolean = false;
  paymentHandler: any = null;
  ngAmount = null;

  @ViewChild(StripeCardComponent) card: StripeCardComponent;
  stripeTest: FormGroup;
  paying = false;
  ngName: any;
  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };
  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private fb: FormBuilder,
    private stripeService: StripeService
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.stripeTest = this.fb.group({
      name: ["Angular v11", [Validators.required]],
      amount: [1005, [Validators.required, Validators.pattern(/\d+/)]]
    });
    this.getOrderDetail();

  }
  createToken(): void {
    if (this.ngName.trim() == '' || !this.ngAmount) {
      this._orderService.snackBar('Please fill out the required fields');
      return;
    }
    const name = this.ngName;
    this.isPaymentLoader = true;
    this.stripeService
      .createToken(this.card.element, { name })
      .subscribe((result) => {
        if (result.token) {
          // Use the token
          let payload: StripePayment = {
            stripe_token: result.token.id,
            stripe_price: Number(this.ngAmount),
            stripe_transaction: true,
            order_id: Number(this.orderDetail.pk_orderID)
          }
          this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
            this.isPaymentLoader = false;
            if (res.paid) {
              this.ngAmount = null;
              // this.orderDetail.paymentDate = new Date(res?.created);
              // console.log(new Date(res?.created))
              this._orderService.snackBar(`Payment Succeeded txID:${res?.balance_transaction}`);
            }
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._orderService.snackBar('Something went wrong');
            this.isPaymentLoader = false;
            this._changeDetectorRef.markForCheck();
          });
        } else if (result.error) {
          // Error creating the token
          this.isPaymentLoader = false;
          this._orderService.snackBar(result.error.message)
          // console.log(result.error.message);
        }
      });
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.ngAmount = this.orderDetail.orderTotal;
      this.ngName = this.orderDetail.billingFirstName + ' ' + this.orderDetail.billingLastName;
      this.isLoading = false;
    });
  }
  ngOnDestroy() {
  }

}
