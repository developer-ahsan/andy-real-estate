import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-user-comments',
  templateUrl: './user-comments.component.html'
})
export class UserCommentsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
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

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this.comments = this._customerService.getCustomerComments(pk_userID)
      .subscribe((addresses) => {
        this.adminComment = addresses["data"][0].adminComments;
        this.getCommentators();
      }, err => {
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
    this.commentAddingForm = this._formBuilder.group({
      comment: ['']
    });
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
    this._customerService.getCommentators(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.commentators = this.commentators.concat(res["data"]);
      this.totalCommentator = res["totalRecords"];
      this.isCommentatorLoader = false;
      this.isLoadMore = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
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
    this.comments.unsubscribe();
    this.isLoadingChange.emit(false);
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
    this.isAddCommentLoader = true;

    const { pk_userID } = this.currentSelectedCustomer;
    const payload = {
      admin_comment: this.ngComment,
      user_id: pk_userID,
      emails: emailArr,
      user_comment: true
    };
    this.commentUpdateLoader = true;
    return this._customerService.updateUserComments((payload))
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.adminComment = payload.admin_comment;


        this._customerService.getCustomerComments(pk_userID)
          .subscribe((addresses) => {
            this.commentUpdateLoader = false;
            this.isAddCommentLoader = false;
            this.adminComment = addresses["data"][0].adminComments;
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
