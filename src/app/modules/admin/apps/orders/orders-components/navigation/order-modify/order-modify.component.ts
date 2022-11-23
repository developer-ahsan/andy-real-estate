import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { addComment } from '../../orders.types';

@Component({
  selector: 'app-order-modify',
  templateUrl: './order-modify.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderModifyComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
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
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _authService: AuthService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);

    this.emailControl.valueChanges.pipe(debounceTime(500), tap(() => {
      this.resultEmails = [];
      this.isEmailLoader = true;
      this._changeDetectorRef.markForCheck();
    }),
      switchMap(value => this._orderService.getCommentatorEmails(value)
        .pipe(
          finalize(() => {
            this.isEmailLoader = false;
            this._changeDetectorRef.markForCheck();
          }),
        ))).subscribe(data => {
          this.resultEmails = data["data"] as any[];
          this._changeDetectorRef.markForCheck();
        });

    this.isLoading = true;
    this.getOrderComments();
    setTimeout(() => {
      this.isLoadingChange.emit(false);
    }, 100);
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  };
  getOrderComments() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentComments = res["data"][0].internalComments;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  calledScreen(value) {
    this.mainScreen = value;
    if (value == 'Current Comments') {
      if (this.currentComments) {
        // this.getCurrentRelatedProducts(1);
      }
    }
  }

  selectedEmails(res) {
    this.emailSelected.push(res.email);
    this.emailControl.reset();
  }
  removeSelectedEmail(index) {
    this.emailSelected.splice(index, 1);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
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

  addComment() {
    let emailArr = this.emails.concat(this.emailSelected);
    if (this.ngComment! == '') {
      this._snackBar.open("Comment is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (emailArr.length == 0) {
      this._snackBar.open("Email is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.isAddCommentLoader = true;
    let payload: addComment = {
      order_id: Number(this.selectedOrder.pk_orderID),
      comment: this.ngComment,
      emails: emailArr,
      add_comment: true
    }
    this._orderService.AddComment(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getOrderDetail(this.selectedOrder.pk_orderID);
    }, err => {
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getOrderDetail(orderId) {
    let params = {
      main: true,
      order_id: orderId
    }
    this._orderService.getOrderMainDetail(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._snackBar.open("Comment added successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.ngComment = '';
      this.emails = [];
      this.emailSelected = [];
      this.mainScreen = 'Current Comments';
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddCommentLoader = false;
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
