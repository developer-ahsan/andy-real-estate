import { Component, Input, Output, OnInit, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { CustomersService } from '../../orders.service';
import { Router } from '@angular/router';

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
  selectedCustomer: any;
  isLoading: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  clickedRows = new Set<PeriodicElement>();
  displayedColumns: string[] = ['pk_cartID', 'dateCreated', 'dateModified', 'storeName', 'items', 'price', 'artwork', 'remove'];
  dataSource = [];
  savedCartsLength: number = 0;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private router: Router
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
          cart: true,
          user_id: this.selectedCustomer.pk_userID
        }
        this._customerService.GetApiData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })).subscribe(carts => {
          this.dataSource = carts["data"];
          this.savedCartsLength = carts["totalRecords"];
        }, err => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        })
      });
  }

  getItems(item: any) {

    const itemsArray = item.split(",,");
    let htmlOutput = '';
    itemsArray.forEach((item, index) => {
      const components = item.split("::");
      htmlOutput += `<div>
                        <p> <span class="font-bold">${index + 1}. </span> ${components[0]}</p>
                        <p><span class="font-bold">Colors</span>: ${components[1]}</p>
                        <p><span class="font-bold">Setup</span>: NONE</p>
                        <p><span class="font-bold">Add. Run</span>: NONE</p>
                    
                </div>`;
    });
    return htmlOutput;
  }

  navigate(cart) {
    this.router.navigateByUrl(`/apps/customers/${this.selectedCustomer.pk_userID}/saved-carts-detail/${cart.cartID}/${cart.dateCreated}/${cart.storeName}`);
  }

  navigateToSummary(cart) {
    this.router.navigateByUrl(`/apps/quotes/${cart.cartID}/summary`);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}

