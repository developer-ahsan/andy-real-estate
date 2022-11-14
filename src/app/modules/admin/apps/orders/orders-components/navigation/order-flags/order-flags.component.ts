import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { UpdateOrderFlag } from '../../orders.types';

@Component({
  selector: 'app-order-flags',
  templateUrl: './order-flags.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderFlagsComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;
  orderDetailTemp: any;
  isLoader: boolean = false;
  flagForm: FormGroup;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.flagForm = new FormGroup({
      blnFulfillmentCancel: new FormControl(),
      blnFinalized: new FormControl(),
      blnIgnore: new FormControl(),
      blnReorderIgnore: new FormControl(),
      blnReviewIgnore: new FormControl(),
      blnRoyaltyIgnore: new FormControl(),
      blnIgnoreSales: new FormControl()
    })
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this.orderDetail = res["data"][0];
      this.flagForm.patchValue(this.orderDetail);
      this._changeDetectorRef.markForCheck();
    })
  };
  updateOrderFlags() {
    const { blnFulfillmentCancel, blnFinalized, blnIgnore, blnReorderIgnore, blnReviewIgnore, blnRoyaltyIgnore, blnIgnoreSales } = this.flagForm.getRawValue();
    let payload: UpdateOrderFlag = {
      blnFulfillmentCancel, blnFinalized, blnIgnore, blnReorderIgnore, blnReviewIgnore, blnRoyaltyIgnore, blnIgnoreSales, isblnFulfillmentCancelChanged: false, isblnFinalizedChanged: false, isblnIgnoreChanged: false, isblnReorderIgnoreChanged: false, isblnReviewIgnoreChanged: false, isblnRoyaltyIgnoreChanged: false, isblnIgnoreSalesChanged: false, order_id: this.selectedOrder.pk_orderID, update_order_flag: true
    }
    if (this.orderDetail.blnFulfillmentCancel != blnFulfillmentCancel) {
      payload.isblnFulfillmentCancelChanged = true;
    }
    if (this.orderDetail.blnFinalized != blnFinalized) {
      payload.isblnFinalizedChanged = true;
    }
    if (this.orderDetail.blnIgnore != blnIgnore) {
      payload.isblnIgnoreChanged = true;
    }
    if (this.orderDetail.blnReorderIgnore != blnReorderIgnore) {
      payload.isblnReorderIgnoreChanged = true;
    }
    if (this.orderDetail.blnReviewIgnore != blnReviewIgnore) {
      payload.isblnReviewIgnoreChanged = true;
    }
    if (this.orderDetail.blnRoyaltyIgnore != blnRoyaltyIgnore) {
      payload.isblnRoyaltyIgnoreChanged = true;
    }
    if (this.orderDetail.blnIgnoreSales != blnIgnoreSales) {
      payload.isblnIgnoreSalesChanged = true;
    }
    this.isLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.getOrderDetail(this.selectedOrder.pk_orderID, res.message)

    }, err => {
      this.isLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getOrderDetail(orderId, msg) {
    let params = {
      main: true,
      order_id: orderId
    }
    this._orderService.getOrderMainDetail(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._orderService.snackBar(msg);
      this.isLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoader = false;
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
