import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-comments',
  templateUrl: './user-comments.component.html'
})
export class UserCommentsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private comments: Subscription;
  adminComment: string;
  commentators: [];
  commentAddingForm: FormGroup;
  commentator_emails: string[];
  commentUpdateLoader = false;
  flashMessage: 'success' | 'error' | null = null;
  allSelected = false;

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this.comments = this._customerService.getCustomerComments(pk_userID)
      .subscribe((addresses) => {
          this.adminComment = addresses["data"][0].adminComments;
          this._customerService.getCommentators()
            .subscribe((commentators) => {
                this.commentators = commentators["data"];
                this.isLoadingChange.emit(false);
            });
      });
    this.commentAddingForm = this._formBuilder.group({
        comment: ['']
    });
  }
  
  ngOnDestroy(): void {
    this.comments.unsubscribe();
    this.isLoadingChange.emit(false);
  }

  // Public functions
  addComment() {
    const { pk_userID } = this.currentSelectedCustomer;
    const { comment } = this.commentAddingForm.controls;
    const payload = {
      admin_comment : comment.value || 'This is a test comment meant to received by development team',
      user_id: pk_userID,
      emails: this.commentator_emails?.length ?
        this.commentator_emails :
        [],
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
        this.commentUpdateLoader = false;
      });
  }

  selectOption(list){
    this.commentator_emails = list.selectedOptions.selected.map(item => item.value)
  }

  selectAll(){
    this.allSelected = !this.allSelected;
    this.commentator_emails = this.allSelected ? this.commentators.map(function(item) {
      return item['email'];
    }) : [];
  }

  /**
     * Show flash message
     */
   showFlashMessage(type: 'success' | 'error'): void
   {
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
