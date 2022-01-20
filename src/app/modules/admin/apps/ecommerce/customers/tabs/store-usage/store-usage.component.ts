import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-store-usage',
  templateUrl: './store-usage.component.html'
})
export class StoreUsageComponent implements OnInit, OnDestroy {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['storeName', 'action'];
  dataSource: StoresList[] = [];
  storesListLength: number = 0;
  addStoreForm = false;

  selectedStore: string = 'select_store';
  stores: string[] = [
    'RaceWorldPromos.com',
    'AirForceROTCShop.com',
    'universitypromosandprint.com'
  ];


  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const { pk_userID, storeId } = this.currentSelectedCustomer;
    this._customerService.getStores(pk_userID, storeId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((stores) => {
        this.dataSource = stores["data"];
        this.storesListLength = stores["totalRecords"];
        this.isLoadingChange.emit(false);

        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  storeFormToggle() {
    this.addStoreForm = !this.addStoreForm;
  }

  deleteStore(store): void {
    console.log("store", store);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
