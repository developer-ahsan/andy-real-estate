import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-default-margins',
  templateUrl: './default-margins.component.html'
})
export class DefaultMarginsComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  defaultMargins = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getColors(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((margins) => {
        this.defaultMargins = margins["data"];
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

}
