import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cashback',
  templateUrl: './cashback.component.html'
})
export class CashbackComponent implements OnInit {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private fetchLocations: Subscription;
  breakpoint: number;
  selectedStore = "select_store";
  stores: string[] = [
    'AirForceROTCShop.com',
    'ArmyROTCShop.com',
    'BrandItShop.com',
    'FunnelPromos.com',
    'MySummaShop.com',
    'universitypromosandprint.com'
  ];
  enableOtherForms = false;
  selected = "dont-allow";

  constructor(
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 2;
    const { pk_userID } = this.currentSelectedCustomer;
    this.fetchLocations = this._customerService.getLocations(pk_userID)
      .subscribe((locations) => {
        console.log("locations", locations)
        this.isLoadingChange.emit(false);
      });

      this._customerService.getAvailableLocations(pk_userID)
      .subscribe((available_locations) => {
        console.log("locations", available_locations)
      });
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 2;
  }
  
  storeSelection(){
    this.enableOtherForms = true;
  }

  ngOnDestroy(): void {
    this.fetchLocations.unsubscribe();
  }
  
}


