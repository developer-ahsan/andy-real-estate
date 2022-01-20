import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-approval-contacts',
  templateUrl: './approval-contacts.component.html'
})
export class ApprovalContactsComponent implements OnInit, OnDestroy {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();

  approval_detail_text: string = "Define any additional artwork approval contacts in the fields below. Approval contacts defined here will run specific to this user, in additional to any approval contacts defined at the store level. These approval contacts below only apply if the store approval contacts are set to include the customer-level approval contacts."
  selectedStore: StoresList = null;
  stores: string[] = [
    'RaceWorldPromos.com',
    'RaceWorldPromos.com',
    'RaceWorldPromos.com'
  ];
  storesList: StoresList[] = [];
  storesListLength: number = 0;
  enableAddRequest = false;
  enableBackNavigation = false;
  enableForm = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const { pk_userID, storeId } = this.currentSelectedCustomer;
    this._customerService.getStores(pk_userID, storeId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((stores) => {
        this.storesList = stores["data"];
        this.storesListLength = stores["totalRecords"];
        this.isLoadingChange.emit(false);

        this._changeDetectorRef.markForCheck();
      });
  }

  storeSelection(store) {
    console.log("store selected", store);
    this.enableAddRequest = true;
  }

  approvalFormToggle() {
    this.enableForm = !this.enableForm;
    this.enableBackNavigation = !this.enableBackNavigation;
  }

  toggleBackNavigation() {
    this.enableForm = !this.enableForm;
    this.enableBackNavigation = !this.enableBackNavigation;
    this.enableAddRequest = false;
    this.selectedStore = null;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
