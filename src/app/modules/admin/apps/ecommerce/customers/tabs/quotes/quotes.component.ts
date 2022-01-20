import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html'
})
export class QuotesComponent implements OnInit, OnDestroy {

  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = [];
  quotesLength = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this._customerService.getQuotes(pk_userID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((quotes) => {
        this.dataSource = quotes["data"];
        this.quotesLength = quotes["totalRecords"];
        this._changeDetectorRef.markForCheck();
        this.isLoadingChange.emit(false);
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

