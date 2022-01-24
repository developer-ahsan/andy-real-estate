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
  flashMessage: 'success' | 'error' | null = null;


  selectedStore = null;
  stores: string[] = [
    'RaceWorldPromos.com',
    'AirForceROTCShop.com',
    'universitypromosandprint.com'
  ];
  commentUpdateLoader = false;
  allStores = [];

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

        this._changeDetectorRef.markForCheck();
      });

    this._customerService.getAllStores()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((stores) => {
        this.allStores = stores["data"];
        this._changeDetectorRef.markForCheck();
      });

    setTimeout(() => {

      this.isLoadingChange.emit(false);

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  }

  storeFormToggle() {
    this.addStoreForm = !this.addStoreForm;
  }

  deleteStore(store): void {
    console.log("store", store);
  }

  createStore(): void {
    const payload = {
      user_id: this.currentSelectedCustomer.pk_userID,
      store_id: this.selectedStore.pk_storeID,
      store_usage: true
    }
    this.commentUpdateLoader = true;
    this._customerService.createStore(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.commentUpdateLoader = false;
      });
  }

  /**
   * Show flash message
   */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
