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
import { addComment, addComments } from '../../orders.types';

@Component({
  selector: 'app-order-comments',
  templateUrl: './order-comments.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderCommentsComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  mainScreen: string = 'Current Comments';
  currentComments: any;

  dropdownList = [{ id: 1, name: 'ahsan' }, { id: 2, name: 'ahsan1' }];
  dropdownSettings: IDropdownSettings = {};
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  emails = [];
  user: any;

  isAddCommentLoader: boolean = false;
  ngComment: string = '';

  commentators = [];
  isCommentatorLoader: boolean = false;
  totalCommentator = 0;
  commentatorPage = 1;
  isLoadMore: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService,
    private _authService: AuthService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
    this.isLoading = true;
    this.getOrderComments();
    this.isCommentatorLoader = true;
    this.getCommentators();
  };
  getOrderComments() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedOrder = res["data"][0];
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
    let emailArr = this.emails;
    if (this.ngComment! == '') {
      this._snackBar.open("Comment is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.commentators.forEach(element => {
      if (element.checked) {
        emailArr.push(element.email);
      }
    });
    this.isAddCommentLoader = true;
    let payload: addComments = {
      order_id: Number(this.selectedOrder.pk_orderID),
      comment: this.ngComment,
      emails: emailArr,
      store_id: Number(this.selectedOrder.fk_storeID),
      store_userId: Number(this.selectedOrder.fk_storeUserID),
      store_name: this.selectedOrder.storeName,
      internalComments: this.selectedOrder.internalComments,
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
      this.commentators.forEach(element => { element.checked = false });
      this.mainScreen = 'Current Comments';
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Get Commentators
  getCommentators() {
    let params = {
      get_commentators_emails: true,
      page: this.commentatorPage
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.commentators = this.commentators.concat(res["data"]);
      this.totalCommentator = res["totalRecords"];
      this.isCommentatorLoader = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCommentatorLoader = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNexCommentator() {
    this.commentatorPage++;
    this.isLoadMore = true;
    this._changeDetectorRef.markForCheck();
    this.getCommentators();
  }
  checkAllCommentators() {
    this.commentators.forEach(element => {
      element.checked = true;
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
