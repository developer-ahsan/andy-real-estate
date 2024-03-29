import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-metrics',
  templateUrl: './user-metrics.component.html'
})
export class UserMetricsComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private stores: Subscription;
  storeNames: [];
  storesCount: number;
  registersInfo: [];

  constructor(
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this.stores = this._customerService.getCustomerStores(pk_userID)
      .subscribe((stores) => {
        this.storeNames = stores["data"];
        this.storesCount = this.storeNames.length;
        this._customerService.getCustomerRegisterInfo(pk_userID)
          .subscribe((register) => {
            this.registersInfo = register["data"];
            this.isLoadingChange.emit(false);
          });
      });
  }

  ngOnDestroy(): void {
    this.stores.unsubscribe();
  }
}
