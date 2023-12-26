import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-order-review-email',
  templateUrl: './order-review-email.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderReviewEmailComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emails = [];

  emailData: any;
  optedEmail: boolean = false;
  emailLoader: boolean;
  ngMessage = ''
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.emails.push({ email: this.orderDetail.userEmail });
      this.getReorderEmail();
    })
  };
  getReorderEmail() {
    let params = {
      opt_in: true,
      store_id: this.orderDetail.fk_storeID,
      email: this.orderDetail.managerEmail
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.emails.includes(value)) {
      this.emails.push(value);
    }
    event.chipInput!.clear();
  }

  remove(email): void {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  sendEmail() {
    if (this.emails.length == 0) {
      this._orderService.snackBar('Please add an email to notify');
      return;
    }
    this.emailLoader = true;
    let payload = {
      order_id: this.orderDetail.pk_orderID,
      emails: this.emails,
      message: this.ngMessage,
      review_email: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
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
