import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-send-register-emails',
  templateUrl: './send-register-emails.component.html'
})
export class SendRegisterEmailsComponent implements OnInit, OnDestroy {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['name', 'action'];
  storesList: StoresList[] = [];
  storesLength: number = 0;
  selectedStore: StoresList = null;

  addStoreForm = false;
  flashMessage: string = '';

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
          store_id: this.selectedCustomer.storeId,
          user_id: this.selectedCustomer.pk_userID
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(stores => {
          this.storesList = stores["data"];
          this.storesLength = stores["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }
  storeSelection(store) {
    console.log("store selected", store);
  }

  storeFormToggle() {
    this.addStoreForm = !this.addStoreForm;
  }

  sendEmail(): void {
    this.flashMessage = "success";
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
