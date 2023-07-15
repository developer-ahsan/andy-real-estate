import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { userComment } from '../../customers.types';

@Component({
  selector: 'app-user-comments',
  templateUrl: './user-comments.component.html'
})
export class UserCommentsComponent implements OnInit {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private comments: Subscription;
  adminComment: string;
  commentAddingForm: FormGroup;
  commentator_emails: string[];
  commentUpdateLoader = false;
  flashMessage: 'success' | 'error' | null = null;
  allSelected = false;


  mainScreen: string = 'Current Comments';
  currentComments: any;

  ngComment: string = '';
  commentators = [];
  isCommentatorLoader: boolean = false;
  totalCommentator = 0;
  commentatorPage = 1;
  isLoadMore: boolean = false;

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  emails = [];
  isAddCommentLoader: boolean;

  totalComments = 0;
  commentsPage = 1;
  isLoadComments: boolean = false;

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.commentAddingForm = this._formBuilder.group({
      comment: ['']
    });
    this.getCustomer();
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        let params = {
          user_comment: true,
          user_id: this.selectedCustomer.pk_userID,
          page: this.commentsPage
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this.isLoadComments = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(comments => {
          this.adminComment = comments["data"][0].adminComments;
          this.totalComments = comments["totalRecords"];
          if (this.commentsPage == 1) {
            this.getCommentators();
          }
        }, err => {
          this.isLoadComments = false;
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }
  getNextComments() {
    this.commentsPage++;
    this.isLoadComments = true;
    this.getCustomer();
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
  getCommentators() {
    let params = {
      commentor: true,
      page: this.commentatorPage
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.commentators = this.commentators.concat(res["data"]);
      this.totalCommentator = res["totalRecords"];
      this.isCommentatorLoader = false;
      this.isLoadMore = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCommentatorLoader = false;
      this.isLoadMore = false;
      this.isLoading = false;
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
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // Public functions
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
    if (emailArr.length == 0) {
      this._snackBar.open("Please add an email to notify", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.isAddCommentLoader = true;

    const { pk_userID, userName } = this.selectedCustomer;
    const payload: userComment = {
      admin_comment: this.ngComment,
      user_id: pk_userID,
      user_name: userName,
      emails: emailArr,
      user_comment: true
    };
    this.commentUpdateLoader = true;
    return this._customerService.PutApiData((payload))
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.ngComment = '';
        this.emails = [];
        this.commentators.forEach(element => {
          element.checked = false;
        });

        let param = {
          user_comment: true,
          user_id: this.selectedCustomer.pk_userID,
          page: 1
        }
        this._customerService.GetApiData(param)
          .subscribe((comments) => {
            this.commentUpdateLoader = false;
            this.isAddCommentLoader = false;
            this._changeDetectorRef.markForCheck();
            this.adminComment = comments["data"][0].adminComments;
            this.mainScreen = 'Current Comments';
            this._snackBar.open("Comment added successfully", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
          });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  selectOption(list) {
    this.commentator_emails = list.selectedOptions.selected.map(item => item.value)
  }

  selectAll() {
    this.allSelected = !this.allSelected;
    this.commentator_emails = this.allSelected ? this.commentators.map(function (item) {
      return item['email'];
    }) : [];
  }

  /**
     * Show flash message
     */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }
}
