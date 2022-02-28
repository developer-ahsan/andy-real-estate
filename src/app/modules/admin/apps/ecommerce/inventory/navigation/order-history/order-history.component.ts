import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';

interface Transaction {
  item: string;
  cost: number;
}

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html'
})
export class OrderHistoryComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  order_history = [];
  displayedColumns: string[] = ['pk_orderID', 'quantity', 'companyName', 'orderDate', 'storeName', 'orderTotal'];
  transactions: Transaction[] = [
    { item: 'Beach ball', cost: 4 },
    { item: 'Towel', cost: 5 },
    { item: 'Frisbee', cost: 2 },
    { item: 'Sunscreen', cost: 4 },
    { item: 'Cooler', cost: 25 },
    { item: 'Swim suit', cost: 15 },
  ];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getOrderHistoryByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((history) => {

        console.log("order history ", history)
        this.order_history = history["data"];
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }
}