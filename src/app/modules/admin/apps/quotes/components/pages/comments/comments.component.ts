import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuotesService } from '../../quotes.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AuthService } from 'app/core/auth/auth.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { AddCartComment, RemoveCartComment } from '../../quotes.types';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

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

  mainScreen: string = 'Current Comments';
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
  currentComment: any = [];
  blnUrgent: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _quoteService: QuotesService,
    private _commonService: DashboardsService,
    private _authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
    this.isLoading = true;
    this.getQuotesDetails();
    this.getQuoteComments();
    this.isCommentatorLoader = true;
    this.getCommentators();
  };
  getQuotesDetails() {
    this._quoteService.qoutesDetails$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedQuote = res["data"][0];
      this.commentators.push(
        { email: `orders@${this.selectedQuote.storeName}`, checked: false },
        { email: `artwork@${this.selectedQuote.storeName}`, checked: false },
        { email: `billing@consolidus.com`, checked: false },
        { email: `service@${this.selectedQuote.storeName}`, checked: false },
        { email: `content@consolidus.com`, checked: false }
      )
      let comments = this.selectedQuote.comments;
      if (comments) {
        let split_comment = comments.split(',,');
      }
      this.currentComments = res["data"][0].internalComments;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getQuoteComments() {
    this._quoteService.qoutesComments$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentComment = res["data"];
    });
  }
  getQuoteCommentsData() {
    let params = {
      cart_comments: true,
      cart_id: this.selectedQuote.pk_cartID
    }
    this._quoteService.getQuoteComments(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.currentComment = res["data"];
      this._quoteService.snackBar('Quote Comment Added Successfully.');
      this.blnUrgent = false;
      this.ngComment = '';
      this.emails = [];
      this.mainScreen = 'Current Comments';
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  calledScreen(value) {
    this.mainScreen = value;
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

  addComment() {
    let emailArr = this.emails;

    if (this.ngComment! == '') {
      this._quoteService.snackBar('Comment is required');
      return;
    }
    this.commentators.forEach(element => {
      if (element.checked) {
        if (this._commonService.isValidEmail(element.email)) {
          emailArr.push(element.email);
        }
      }
    });
    if (emailArr.length == 0) {
      this._quoteService.snackBar('Please add any email');
      return;
    }
    this.isAddCommentLoader = true;
    let payload: AddCartComment = {
      fk_cartID: Number(this.selectedQuote.pk_cartID),
      comment: this.ngComment,
      fk_adminUserID: Number(this.selectedQuote.storeUserID),
      dateCreated: moment().format('yyyy-MM-dd hh:mm:ss'),
      emails: emailArr,
      blnUrgent: this.blnUrgent,
      storeName: this.selectedQuote.storeName,
      add_cart_comment: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    payload = this._commonService.replaceNullSpaces(payload);
    if (!payload.comment || payload.emails.length == 0) {
      this._quoteService.snackBar('Please fill out the required fields');
    }

    this._quoteService.AddQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getQuoteCommentsData();
    }, err => {
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Get Commentators
  getCommentators() {
    let params = {
      commentator_emails: true,
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
  removeCartComment(item, index) {
    item.delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: RemoveCartComment = {
      commentID: Number(item.pk_cartCommentID),
      remove_cart_comment: true
    }
    this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        this.currentComment.splice(index, 1);
      }
      item.delLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.delLoader = false;
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
