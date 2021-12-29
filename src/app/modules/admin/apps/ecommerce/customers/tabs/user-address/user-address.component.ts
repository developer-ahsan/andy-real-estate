import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.component.html'
})
export class UserAddressComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private fetchAddress: Subscription;
  customerAddresses: [];
  addressCount: number = 0;
  breakpoint: number;

  constructor(
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 620) ? 1 : 2;
    const { pk_userID } = this.currentSelectedCustomer;
    this.fetchAddress = this._customerService.getCustomerAddresses(pk_userID)
      .subscribe((addresses) => {
          this.customerAddresses = addresses["data"];
          this.addressCount = this.customerAddresses.length
          this.isLoadingChange.emit(false);
      });
  }

  ngOnDestroy(): void {
    this.fetchAddress.unsubscribe();
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 620) ? 1  : 2;
  }

}
