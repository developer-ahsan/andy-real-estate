import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-cashback',
  templateUrl: './cashback.component.html'
})
export class CashbackComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  breakpoint: number;
  selectedStore: StoresList = null;
  storesList: StoresList[] = [];
  storesListLength: number = 0;

  updateLoader = false;
  enableOtherForms = false;
  selected = "dont-allow";
  flashMessage: 'success' | 'error' | null = null;

  commentUpdateLoader = false;

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getCustomer();
  }
  getCustomer() {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        let params = {
          approval_contact: true,
          user_id: this.selectedCustomer.pk_userID,
          store_id: this.selectedCustomer.storeId
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(stores => {
          this.storesList = stores["data"];
          this.storesListLength = stores["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 800) ? 1 : 2;
  }

  storeSelection(store: StoresList) {
    this.enableOtherForms = true;
    this.selectedStore = store;
  }

  updateCashback(): void {
    const { storeID } = this.selectedStore;
    const payload = {
      cash_back: true,
      user_id: this.selectedCustomer.pk_userID,
      store_id: storeID,
      cash_back_status: this.selected === 'allow' ? true : false
    }
    this.commentUpdateLoader = true;
    this._customerService.PutApiData(payload)
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


