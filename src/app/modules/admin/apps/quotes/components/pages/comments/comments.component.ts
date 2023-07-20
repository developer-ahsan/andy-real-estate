import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../quotes.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AuthService } from 'app/core/auth/auth.service';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class QuoteComments implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  selectedQuote: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  mainScreen: string = 'Add New Comment';
  currentComments: any;
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
    private _quoteService: QuotesService,
    private _authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
    this.isLoading = true;
    // this.getOrderComments();
    this.isCommentatorLoader = true;
    this.getCommentators();
  };
  getOrderComments() {
    this._quoteService.qoutesDetails$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedQuote = res["data"][0];
      this.commentators.push(
        { email: `orders@${this.selectedQuote.storeName}`, checked: false },
        { email: `artwork@${this.selectedQuote.storeName}`, checked: false },
        { email: `billing@consolidus.com`, checked: false },
        { email: `service@${this.selectedQuote.storeName}`, checked: false },
        { email: `content@consolidus.com`, checked: false }
      )
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
      this._quoteService.snackBar('Comment is required');
      return;
    }
    this.commentators.forEach(element => {
      if (element.checked) {
        emailArr.push(element.email);
      }
    });
    this.isAddCommentLoader = true;
    let payload = {
      order_id: Number(this.selectedQuote.pk_orderID),
      comment: this.ngComment,
      emails: emailArr,
      company_name: this.selectedQuote.billingCompanyName,
      store_id: Number(this.selectedQuote.fk_storeID),
      store_userId: Number(this.selectedQuote.fk_storeUserID),
      store_name: this.selectedQuote.storeName,
      internalComments: this.selectedQuote.internalComments,
      add_comment: true
    }
    this._quoteService.AddQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getOrderDetail(this.selectedQuote.pk_orderID);
    }, err => {
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getOrderDetail(orderId) {
    // let params = {
    //   main: true,
    //   order_id: orderId
    // }
    // this._orderService.getOrderMainDetail(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   this._snackBar.open("Comment added successfully", '', {
    //     horizontalPosition: 'center',
    //     verticalPosition: 'bottom',
    //     duration: 3500
    //   });
    //   this.ngComment = '';
    //   this.emails = [];
    //   this.commentators.forEach(element => { element.checked = false });
    //   this.mainScreen = 'Current Comments';
    //   this.isAddCommentLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   this.isAddCommentLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // })
  }
  // Get Commentators
  getCommentators() {
    let params = {
      get_commentators_emails: true,
      page: this.commentatorPage
    }
    this._quoteService.getQuoteData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
