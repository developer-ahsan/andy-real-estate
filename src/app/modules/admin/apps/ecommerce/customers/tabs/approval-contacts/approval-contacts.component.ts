import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';

@Component({
  selector: 'app-approval-contacts',
  templateUrl: './approval-contacts.component.html'
})
export class ApprovalContactsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  approval_detail_text: string = "Define any additional artwork approval contacts in the fields below. Approval contacts defined here will run specific to this user, in additional to any approval contacts defined at the store level. These approval contacts below only apply if the store approval contacts are set to include the customer-level approval contacts."
  selectedStore: string = 'select_store';
  stores: string[] = [
    'RaceWorldPromos.com',
    'RaceWorldPromos.com',
    'RaceWorldPromos.com'
  ];

  enableAddRequest = false;
  enableBackNavigation = false;
  enableForm = false;

  constructor(
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this._customerService.getLocations(pk_userID)
      .subscribe((locations) => {
          this.isLoadingChange.emit(false);
      });
  }

  storeSelection(store){
    console.log("store selected", store);
    this.enableAddRequest = true;
  }

  approvalFormToggle() {
    this.enableForm = !this.enableForm;
    this.enableBackNavigation = !this.enableBackNavigation;
  }

  toggleBackNavigation(){
    this.enableForm = !this.enableForm;
    this.enableBackNavigation = !this.enableBackNavigation;
    this.enableAddRequest = false;
    this.selectedStore = 'select_store';
  }
}
