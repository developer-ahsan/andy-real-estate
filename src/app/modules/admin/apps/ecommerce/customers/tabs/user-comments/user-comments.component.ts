import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
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
  adminComments: [];
  commentators: [];
  commentAddingForm: FormGroup;
  commentator_emails: string[];

  constructor(
    private _customerService: CustomersService,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this.comments = this._customerService.getCustomerComments(pk_userID)
      .subscribe((addresses) => {
          this.adminComments = addresses["data"][0].adminComments;
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
    const { comment } = this.commentAddingForm.controls;
    console.log("emailsArray ",this.commentator_emails)
    console.log("comment ", comment.value)
    return;
  }

  onAreaListControlChanged(list){
    this.commentator_emails = list.selectedOptions.selected.map(item => item.value)
  }
}
