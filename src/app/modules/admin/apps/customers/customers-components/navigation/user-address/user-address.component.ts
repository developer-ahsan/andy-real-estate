import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.component.html'
})
export class UserAddressComponent implements OnInit {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private fetchAddress: Subscription;
  customerAddresses: [];
  addressCount: number = 0;
  breakpoint: number;

  page = 1;
  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getUserAddresses(1);
      });
    this.breakpoint = (window.innerWidth <= 620) ? 1 : 2;
  }
  getUserAddresses(page) {
    let params = {
      page: page,
      address: true,
      user_id: this.selectedCustomer.pk_userID
    }
    this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(addresses => {
      this.customerAddresses = addresses["data"];
      this.addressCount = addresses["totalRecords"];
    })
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getUserAddresses(this.page);
  };
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 620) ? 1 : 2;
  }

}
