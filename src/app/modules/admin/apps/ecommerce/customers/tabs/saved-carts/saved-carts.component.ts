import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { CustomersService } from 'app/modules/admin/apps/ecommerce/customers/customers.service';
import { takeUntil } from 'rxjs/operators';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-saved-carts',
  templateUrl: './saved-carts.component.html'
})
export class SavedCartsComponent implements OnInit, OnDestroy {
  @Input() currentSelectedCustomer: any;
  @Input() selectedTab: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  clickedRows = new Set<PeriodicElement>();
  displayedColumns: string[] = ['pk_cartID', 'dateCreated', 'storeName', 'price', 'cost'];
  dataSource = [];
  savedCartsLength: number = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const { pk_userID } = this.currentSelectedCustomer;
    this._customerService.getCarts(pk_userID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((carts) => {
        this.dataSource = carts["data"];
        this.savedCartsLength = carts["totalRecords"];
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

