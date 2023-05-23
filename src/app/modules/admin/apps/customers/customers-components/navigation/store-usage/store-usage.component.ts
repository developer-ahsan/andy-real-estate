import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-store-usage',
  templateUrl: './store-usage.component.html'
})
export class StoreUsageComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
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
    this.isLoading = true;
    this.getCustomer();
    this._customerService.getAllStores()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((stores) => {
        this.allStores = stores["data"];
        this._changeDetectorRef.markForCheck();
      });
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        let params = {
          approval_contact: true,
          store_id: this.selectedCustomer.storeId,
          user_id: this.selectedCustomer.pk_userID
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(stores => {
          this.dataSource = stores["data"];
          this.storesListLength = stores["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }




  storeFormToggle() {
    this.addStoreForm = !this.addStoreForm;
  }

  deleteStore(store): void {
  }

  createStore(): void {
    const payload = {
      user_id: this.selectedCustomer.pk_userID,
      store_id: this.selectedStore.pk_storeID,
      store_usage: true
    }
    this.commentUpdateLoader = true;
    this._customerService.PostApiData(payload)
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
