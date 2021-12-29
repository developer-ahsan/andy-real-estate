import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
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

  emails: string[] = [
    'alecia.moneypenny@consolidus.com',
    'billing@consolidus.com',
    'adam.b@consolidus.com',
    'amanda.w@consolidus.com',
    'brooke@consolidus.com',
    'consolidusbill@gmail.com',
    'content@consolidus.com',
    'denise.cline@consolidus.com',
    'evan.a@consolidus.com',
    'jeffrey.jones@consolidus.com',
    'krysti.horvat@consolidus.com',
    'leilani.bever@consolidus.com',
    'lindsey.myers@consolidus.com',
    'matt.h@consolidus.com',
    'nicole.a@consolidus.com',
    'nolan.h@consolidus.com',
    'rhianne.smith@consolidus.com',
    'sara.m@consolidus.com',
    'tony.cucolo@consolidus.com',
    'troy.louis@consolidus.com'
  ];

  constructor(
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this.comments = this._customerService.getCustomerComments(pk_userID)
      .subscribe((addresses) => {
          this.adminComments = addresses["data"][0].adminComments;
          this.isLoadingChange.emit(false);
      });
  }
  
  ngOnDestroy(): void {
    this.comments.unsubscribe();
    this.isLoadingChange.emit(false);
  }
}
