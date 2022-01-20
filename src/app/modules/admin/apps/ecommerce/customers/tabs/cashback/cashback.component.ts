import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { Subject } from 'rxjs';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-cashback',
  templateUrl: './cashback.component.html'
})
export class CashbackComponent implements OnInit, OnDestroy {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  breakpoint: number;
  selectedStore: StoresList = null;
  storesList: StoresList[] = [];
  storesListLength: number = 0;

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
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.breakpoint = (window.innerWidth <= 800) ? 1 : 2;
    const { pk_userID, storeId } = this.currentSelectedCustomer;
    this._customerService.getStores(pk_userID, storeId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((stores) => {
        this.storesList = stores["data"];
        this.storesListLength = stores["totalRecords"];
        this.isLoadingChange.emit(false);

        this._changeDetectorRef.markForCheck();
      });

    // this._customerService.getAvailableLocations(pk_userID)
    //   .subscribe((available_locations) => {
    //     console.log("locations", available_locations)
    //   });
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 2;
  }

  storeSelection(store: StoresList) {
    this.enableOtherForms = true;
    console.log("store selected", store)
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}


