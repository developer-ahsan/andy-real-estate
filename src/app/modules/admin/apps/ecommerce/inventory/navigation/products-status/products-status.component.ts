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
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  allStoresSelected = [];
  storesData = [];

  // Boolean
  isRapidBuild: boolean;
  allSelected = false;
  isCopyImage = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.isRapidBuild = true;

    this._inventoryService.getAllStores()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((stores) => {
        this.storesData = stores["data"];

        this._changeDetectorRef.markForCheck();
        this.isLoadingChange.emit(false);
      });
  }

  assignStore(): void {
    console.log("assigned store");
  }

  selectAll(): void {
    this.allSelected = !this.allSelected;
    this.allStoresSelected = this.allSelected ? this.storesData.map(function (item) {
      return item;
    }) : [];

    this._changeDetectorRef.markForCheck();
  };

  rapidBuildToggle(): void {
    this.isRapidBuild = !this.isRapidBuild;

    this._changeDetectorRef.markForCheck();
  };

  copyImageToggle(): void {
    this.isCopyImage = !this.isCopyImage;

    this._changeDetectorRef.markForCheck();
  };

}
