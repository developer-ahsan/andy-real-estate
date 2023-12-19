import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-order-payment-email',
  templateUrl: './order-payment-email.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderPaymentEmailComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  @Input() selectedOrder: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;
  sendEmailLoader: boolean = false;

  formData: any = {
    email: '',
    subject: '',
    message: ''
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emails = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      this.formData.email = `*INITIATOR* - ${this.orderDetail.shippingFirstName.trim()} ${this.orderDetail.shippingLastName.trim()} ${this.orderDetail.shippingEmail}`
      this.formData.subject = `Reminder to pay for your group order on ${this.orderDetail.storeName}`
    })
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
    }, 100);
  };

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.emails.push({ email: value });
    }
    event.chipInput!.clear();
  }

  remove(email): void {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }
  isEmailValid(email: string): boolean {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  sendEmail() {
    if (this.formData.email.trim() === '' || this.formData.subject.trim() === '') {
      this._snackBar.open('Please fill the required fields', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (!this.isEmailValid(this.formData.email)) {
      this._snackBar.open('Email format is not correct', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }

    this.sendEmailLoader = true;

    this._orderService.orderPostCalls(this.formData).pipe(takeUntil(this._unsubscribeAll))
    .subscribe((stores) => {

      this._changeDetectorRef.markForCheck();
    });

    this.sendEmailLoader = false;

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
