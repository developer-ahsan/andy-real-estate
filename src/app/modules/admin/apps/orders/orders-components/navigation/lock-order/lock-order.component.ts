import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { UpdateOrderFlag } from '../../orders.types';
import moment from 'moment';

@Component({
  selector: 'app-lock-order',
  templateUrl: './lock-order.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderLockComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  selectedOrder: any;
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
      blnCancelled: new FormControl(),
      blnFinalized: new FormControl(),
      blnIgnore: new FormControl(),
      blnReorderIgnore: new FormControl(),
      blnReviewIgnore: new FormControl(),
      blnRoyaltyIgnore: new FormControl(),
      blnIgnoreSales: new FormControl(),
      cancelledReason: new FormControl('')
    })
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isLoading = false;
      this.orderDetail = res["data"][0];
      this.flagForm.patchValue(this.orderDetail);
      this._changeDetectorRef.markForCheck();
    })
  };
  updateOrderFlags(check) {
    let blnDateClosed = check;
    let date = '';
    if (check) {
      date = this.orderDetail.formattedDateClosed;
      if (!date) {
        this._orderService.snackBar('Date is required');
        return;
      }
    }

    let payload = {
      order_id: this.orderDetail.pk_orderID,
      bln_date_closed: blnDateClosed,
      dateClosed: date,
      close_order: true
    }
    this.isLoader = true;
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this._orderService.snackBar(res["message"]);
      this.orderDetail.blnClosed = check;
      this.orderDetail.formattedDateClosed = moment(date).format('MM/DD/yyyy');
      this.isLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
