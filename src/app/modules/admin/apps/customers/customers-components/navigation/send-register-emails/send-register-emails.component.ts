import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StoresList } from 'app/modules/admin/apps/ecommerce/customers/customers.types';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { FormControl } from '@angular/forms';
import { sendRegistrationEmails } from '../../orders.types';
import { error } from 'console';

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

  addStoreForm = false;
  flashMessage: string = '';
  stores: string[] = [
    'RaceWorldPromos.com',
    'AirForceROTCShop.com',
    'universitypromosandprint.com'
  ];


  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;

  isSendEmailLoader: boolean = false;

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
        console.log(this.selectedCustomer)
        this.initialize();
        this.getStores();
      });
  }
  initialize() {
    let params;
    this.searchStoreCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          store_usage: true,
          user_id: this.selectedCustomer.pk_userID,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allStores = [];
        this.isSearchingStore = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._customerService.GetApiData(params)
        .pipe(
          finalize(() => {
            this.isSearchingStore = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allStores = data["data"];
    });
  }
  getStores() {
    let params = {
      store_usage: true,
      user_id: this.selectedCustomer.pk_userID
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(stores => {
      this.allStores = stores["data"];
      // this.selectedStore = this.allStores[0];
      // this.searchStoreCtrl.setValue(this.selectedStore);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  onSelected(ev) {
    if (this.selectedStore != ev.option.value) {
      this.selectedStore = ev.option.value;
    }
  }
  displayWith(value: any) {
    return value?.storeName;
  }
  storeSelection(store) {
  }

  storeFormToggle() {
    this.addStoreForm = !this.addStoreForm;
  }

  sendEmail(): void {
    if (!this.selectedStore) {
      this._customerService.snackBar('Please select any store');
      return;
    }
    this.isSendEmailLoader = true;
    let payload: sendRegistrationEmails = {
      store_id: this.selectedStore.storeID,
      user_id: this.selectedCustomer.pk_userID,
      store_name: this.selectedStore.storeName,
      additionalEmails: this.selectedCustomer.additionalEmails,
      user_email: this.selectedCustomer.email,
      send_registration_email: true,
    }
    this._customerService.PostApiData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isSendEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._customerService.snackBar(res["message"]);
      }
    }, err => {
      this.isSendEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
