import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { StripePayment } from '../../orders.types';

interface Transaction {
  item: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-order-payments',
  templateUrl: './order-payments.component.html'
})
export class OrderPaymentComponent implements OnInit {
  isLoading: boolean = false;
  selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  orderDetail: any;
  not_available_price: string = '0';
  isPaymentLoader: boolean = false;
  paymentHandler: any = null;
  ngAmount = null;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.getOrderDetail();
    this.invokeStripe();
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.isLoading = false;
    });
  }
  invokeStripe() {
    if (!window.document.getElementById('stripe-script')) {
      const script = window.document.createElement("script");
      script.id = "stripe-script";
      script.type = "text/javascript";
      script.src = "https://checkout.stripe.com/checkout.js";
      script.onload = () => {
        this.paymentHandler = (<any>window).StripeCheckout.configure({
          key: 'pk_test_51MW7XpKftHck147B5Rokid6Csvq6fNf8Tee690E3KuRzLd9P85yrvvQHpDK22ZTedK5WwzXAc2aVIY21Wyx4ia6V002R7AbvoW',
          locale: 'auto',
          token: function (stripeToken: any) {
            console.log(stripeToken)
            alert('Payment has been successfull!');
          }
        });
      }
      window.document.body.appendChild(script);
    }
  }
  initializePayment() {
    if (this.ngAmount > 0) {
      const paymentHandler = (<any>window).StripeCheckout.configure({
        key: 'pk_test_51MW7XpKftHck147B5Rokid6Csvq6fNf8Tee690E3KuRzLd9P85yrvvQHpDK22ZTedK5WwzXAc2aVIY21Wyx4ia6V002R7AbvoW',
        locale: 'auto',
        token: (stripeToken: any) => {
          let payload: StripePayment = {
            stripe_token: stripeToken.id,
            stripe_price: Number(this.ngAmount),
            stripe_transaction: true,
            order_id: Number(this.orderDetail.pk_orderID)
          }
          if (stripeToken) {
            this.isPaymentLoader = true;
            this._changeDetectorRef.markForCheck();
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
          }

        }
      });

      paymentHandler.open({
        name: this.orderDetail.pk_orderID,
        description: this.orderDetail.userFirstName + ' ' + this.orderDetail.userLastName,
        amount: Number(this.ngAmount * 100)
      });
    } else {
      this._orderService.snackBar('Amount should be greater than 0');
    }

  }

}
