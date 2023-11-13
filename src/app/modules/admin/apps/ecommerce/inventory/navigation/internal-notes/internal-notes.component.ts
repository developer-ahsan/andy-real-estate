import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { commentObj } from '../../inventory.types';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';

@Component({
  selector: 'app-internal-notes',
  templateUrl: './internal-notes.component.html'
})
export class InternalNotesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  flashMessage: 'success' | 'error' | null = null;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;


  isCommentNull = false;
  internalNote: FormGroup;
  comments = [];
  commentsCount = 0;
  commentator_emails: string[];
  commentatoLoader: boolean = true;
  allSelected = false;
  loader = false;
  user: User;

  deleteLoader = false;

  commentators = [];
  isCommentatorLoader: boolean = false;
  totalCommentator = 0;
  commentatorPage = 1;
  isLoadMore: boolean = false;
  userData: any;
  ngComment: string = '';

  emails = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _userService: UserService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _authService: AuthService,
    private _orderService: OrdersService,
    private router: Router,

  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('userDetails');;
    this.userData = JSON.parse(user);
    // Create the selected product form
    this.ngComment = '';
    this.internalNote = this._formBuilder.group({
      comment: [''],
    });

    // Get login user details
    this.user = this._authService.parseJwt(this._authService.accessToken);
    // this._userService.user$
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((user: User) => {
    //     this.user = user;

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    //   });
    this.getProductDetail();

  };
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getIntenalNotes();
      }
    });
  }
  getIntenalNotes() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getCommentByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((comment) => {
        this.comments = comment["data"];
        this.commentsCount = comment["totalRecords"];
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
    this.isCommentatorLoader = true;
    this.getCommentators();
  }
  selectOption(list) {
    this.commentator_emails = list.selectedOptions.selected.map(item => item.value)
  };
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
      get_commentators_emails: true
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let commentators = res["data"][0].commentorsEmail.split(',,');
      commentators.forEach(commentator => {
        const [id, email] = commentator.split('::');
        this.commentators.push({ id, email });
      });
      // this.commentators = this.commentators.concat(res["data"]);
      // this.totalCommentator = res["totalRecords"];
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
 * Show flash message
 */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  }

  selectAll() {
    this.allSelected = !this.allSelected;
    this.commentator_emails = this.allSelected ? this.commentators.map(function (item) {
      return item['email'];
    }) : [];
  }

  addComment(): void {
    const comment = this.ngComment;
    const { pk_productID, fk_addedByAdminUserID, productNumber, productName } = this.selectedProduct;
    let emailArr = this.emails;
    if (!comment) {
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
    const payload: commentObj = {
      comment_id: null,
      product_id: pk_productID,
      product_name: productName,
      product_number: productNumber,
      comment: comment.replace(/'/g, "''"),
      admin_user_id: this.userData.pk_userID,
      name: this.user?.name,
      emails: emailArr,
      call_type: "post",
      internal_comment: true,
    }

    this.loader = true;
    this._inventoryService.updateComment(payload)
      .subscribe((response) => {
        this._inventoryService.getCommentByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((comment) => {
            this._snackBar.open(response["message"], '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.ngComment = '';
            this.emails = [];
            this.commentators.forEach(element => { element.checked = false });
            this.loader = false;
            this.comments = comment["data"];
          }, err => {
            this._snackBar.open("Some error occured", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.loader = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });

      }, err => {
        this._snackBar.open("Some error occured while updating internal notes", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.loader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  deleteComment(comment): void {
    const { pk_productID, fk_addedByAdminUserID, productNumber, productName } = this.selectedProduct;
    const { pk_commentID } = comment;

    const payload = {
      comment_id: pk_commentID,
      product_id: pk_productID,
      product_name: productName,
      product_number: productNumber,
      comment: pk_commentID,
      admin_user_id: fk_addedByAdminUserID,
      name: this.user?.name,
      emails: [],
      call_type: "delete",
      internal_comment: true,
    };

    this.deleteLoader = true;
    this._inventoryService.deleteComment(payload)
      .subscribe((response) => {
        this.deleteLoader = false;
        this._inventoryService.getCommentByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((comment) => {
            this.comments = comment["data"];
            this.commentsCount = comment["totalRecords"];

            this._snackBar.open(response["message"], '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      });
  };
  navigate() {
    this.router.navigateByUrl('/apps/users/admin-commentors');
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

