import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { StripePayment, enter_payment } from '../../orders.types';

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
  referanceNumber: string = ''
  send_receipt: boolean = false;
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
            // console.log(stripeToken)
            alert('Payment has been successfull!');
          }
        });
      }
      window.document.body.appendChild(script);
    }
  }
  initializePayment() {
    let payload: enter_payment = {
      amount_paid: this.ngAmount,
      current_total: this.orderDetail?.currentTotal,
      order_total: this.orderDetail?.orderTotal, // qryOrderTotals.price+qryOrderTotals.tax+qryOrderTotals.royalties
      reference_number: this.referanceNumber?.replace(/'/g, "''"),
      order_id: this.orderDetail.pk_orderID,
      blnWarehouse: this.orderDetail.blnWarehouse,
      send_receipt: this.send_receipt,
      formattedOrderDate: this.orderDetail.formattedOrderDate,
      billingEmail: this.orderDetail.billingEmail,
      storeName: this.orderDetail.storeName,
      enter_payment: true
    }
    const diff = Math.round(this.orderDetail?.orderTotal) - Math.round(this.orderDetail?.currentTotal);
    if (!this.ngAmount) {
      this._orderService.snackBar('Please enter a payment amount below.');
      return;
    }
    if (diff == 0 && this.ngAmount > 0) {
      this._orderService.snackBar('The payment amount entered exceeds the order total.');
      return;
    }
    this.isPaymentLoader = true;
    this.orderDetail.currentTotal = this.orderDetail?.currentTotal + this.ngAmount;
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isPaymentLoader = false;
      this.ngAmount = '';
      this._changeDetectorRef.markForCheck();
    });
  }

}
