import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-user-metrics',
  templateUrl: './user-metrics.component.html'
})
export class UserMetricsComponent implements OnInit {
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private stores: Subscription;
  storeNames: [];
  storesCount: number;
  registersInfo: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _customerService: CustomersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        this.getMetrics();
        // let params = {
        //   store_usage: true,
        //   user_id: this.selectedCustomer.pk_userID
        // }
        // this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
        //   this.isLoading = false;
        //   this._changeDetectorRef.markForCheck();
        // })).subscribe(stores => {
        //   this.storeNames = stores["data"];
        //   this.storesCount = this.storeNames.length;
        //   let param = {
        //     metrics: true,
        //     user_id: this.selectedCustomer.pk_userID
        //   }
        //   this._customerService.GetApiData(param).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
        //     this.isLoading = false;
        //     this._changeDetectorRef.markForCheck();
        //   })).subscribe(register => {
        //     this.registersInfo = register["data"];
        //   });
        // }, err => {
        //   this.isLoading = false;
        //   this._changeDetectorRef.markForCheck();
        // })
      });
  }

  getMetrics() {
    let param = {
      metrics: true,
      user_id: this.selectedCustomer.pk_userID
    }
    this._customerService.GetApiData(param).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(response => {
      this.storeNames = response["qryStoresVisited"];
      response.annualBudget = '';
      response.annualPurchase = '';
      const { annualBudgetMax, annualBudgetMin, annualPurchasesMax, annualPurchasesMin, registrationComments } = response.qryStoreUserMetrics[0];

      if (annualBudgetMin && annualBudgetMax) {
        response.annualBudget = `$ ${annualBudgetMin} - $ ${annualBudgetMax}`;
      } else if (annualBudgetMin && !annualBudgetMax) {
        response.annualBudget = `$ ${annualBudgetMin}`;
      } else {
        response.annualBudget = `(Not provided)`;
      }

      if (annualPurchasesMin && annualPurchasesMax) {
        response.annualPurchase = `$ ${annualPurchasesMin} - $ ${annualPurchasesMax}`;
      } else if (annualPurchasesMin && !annualPurchasesMax) {
        response.annualPurchase = `$ ${annualPurchasesMin}`;
      } else {
        response.annualPurchase = `(Not provided)`;
      }

      this.registersInfo = response;
    });
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
