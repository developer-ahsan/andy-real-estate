import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';

@Component({
  selector: 'app-order-reorder-email',
  templateUrl: './order-reorder-email.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderReorderEmailComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;
  emailData: any;
  optedEmail: boolean = false;
  emailLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;

    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      console.log(this.orderDetail)
      this.getReorderEmail();
    })
  };
  getReorderEmail() {
    let params = {
      opt_in: true,
      store_id: this.orderDetail.fk_storeID,
      email: this.orderDetail.managerEmail
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.emailData = res["data"];
      if (this.emailData.length == 0 || (this.emailData.length != 0 && this.emailData.blnActive)) {
        this.optedEmail = false;
      } else {
        this.optedEmail = true;
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }

  sendEmail() {
    this.emailLoader = true;
    let payload = {
      order_id: this.orderDetail.pk_orderID,
      emails: [
        this.orderDetail.userEmail//email of the user who ordered
      ],
      message: null,
      reorder_email: true
    }
    this._orderService.orderPostCalls(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.emailLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe((res: any) => {
      if (res) {
        this._orderService.snackBar(res?.message);
      }
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
