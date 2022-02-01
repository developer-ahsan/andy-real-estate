import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { ProductsDetails } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-products-status',
  templateUrl: './products-status.component.html'
})
export class ProductsStatusComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() storesData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    // const { pk_productID } = this.selectedProduct;
    // this._inventoryService.getAllStores()
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((stores) => {
    //     this.stores = stores["data"];
    //     console.log("stores ", this.stores)

    //     this._changeDetectorRef.markForCheck();
    //   });

    this.isLoadingChange.emit(false);
  }

  assignStore(): void {
    console.log("assigned store");
  }

}
