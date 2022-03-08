import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.model';

@Component({
  selector: 'app-internal-notes',
  templateUrl: './internal-notes.component.html'
})
export class InternalNotesComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  flashMessage: 'success' | 'error' | null = null;

  isCommentNull = false;
  internalNote: FormGroup;
  comments = [];
  commentsCount = 0;
  commentator_emails: string[];
  allSelected = false;
  commentators: [];
  loader = false;
  user: User;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _userService: UserService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    // Create the selected product form
    this.internalNote = this._formBuilder.group({
      comment: [''],
    });

    // Get login user details
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getCommentByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((comment) => {
        this.comments = comment["data"];
        this.commentsCount = comment["totalRecords"];
        console.log("this.comments", this.comments)
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getCommentators()
      .subscribe((commentators) => {
        console.log("commentators", commentators);
        this.commentators = commentators["data"];
        this.isLoadingChange.emit(false);
      });

    this.isLoadingChange.emit(false);
  }

  selectOption(list) {
    this.commentator_emails = list.selectedOptions.selected.map(item => item.value)
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
    const { comment } = this.internalNote.getRawValue();
    const { pk_productID } = this.selectedProduct;

    if (!comment) {
      this.isCommentNull = true;
      setTimeout(() => {
        this.isCommentNull = false;
      }, 1500);
      return;
    }

    const payload = {
      product_id: pk_productID,
      comment: comment,
      admin_user_id: 866,
      name: this.user?.name,
      emails: this.commentator_emails || [],
      call_type: "post",
      internal_comment: true,
    }

    console.log("payload", payload)
    this.loader = true;
    this._inventoryService.updateComment(payload)
      .subscribe((response) => {
        this._inventoryService.getCommentByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((comment) => {
            this.showFlashMessage(
              response["success"] === true ?
                'success' :
                'error'
            );
            this.internalNote.reset();
            this.loader = false;
            this.comments = comment["data"];
          });

      });
  }

  deleteComment(comment): void {
    const { pk_commentID } = comment;
    const payload = {
      comment_id: pk_commentID,
      call_type: "delete"
    };
    console.log("payload", payload);
    this._inventoryService.deleteComment(payload)
      .subscribe((response) => {
        console.log("Response deleted", response)
      });
  }

}

