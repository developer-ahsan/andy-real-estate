import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-approval-contacts',
  templateUrl: './approval-contacts.component.html'
})
export class ApprovalContactsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  approval_detail_text: string = "Define any additional artwork approval contacts in the fields below. Approval contacts defined here will run specific to this user, in additional to any approval contacts defined at the store level. These approval contacts below only apply if the store approval contacts are set to include the customer-level approval contacts."
  selectedStore: string;
  stores: string[] = [
    'RaceWorldPromos.com',
    'RaceWorldPromos.com',
    'RaceWorldPromos.com'
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
