import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';

@Component({
  selector: 'app-update-history',
  templateUrl: './update-history.component.html'
})
export class UpdateHistoryComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  htmlHistory: string = '';

  v2UpdateHistory = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getHistoryProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((history) => {
        this.v2UpdateHistory = history["data"];
        console.log("this.v2UpdateHistory", this.v2UpdateHistory)
      });

    this._inventoryService.getUpdateHistoryByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((history) => {
        this.htmlHistory = history["data"][0]?.updateHistory;
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }
}

3