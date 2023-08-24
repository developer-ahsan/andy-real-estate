import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html'
})
export class QuotesComponent implements OnInit, OnDestroy {

  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['id', 'created', 'modified', 'ihd', 'store', 'total', 'action'];
  dataSource = [];
  quotesLength = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  page = 1;
  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getQuotes(1);
  }
  getQuotes(page) {
    this._customerService.customer$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.selectedCustomer = response;
        let params = {
          cart: true,
          user_id: this.selectedCustomer.pk_userID,
          bln_quote: 1,
          size: 20,
          page: page
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(quotes => {
          console.log(quotes)
          this.dataSource = quotes["data"];
          this.quotesLength = quotes["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getQuotes(this.page);
  };
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

