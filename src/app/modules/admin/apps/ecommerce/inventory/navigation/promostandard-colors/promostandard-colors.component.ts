import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-promostandard-colors',
  templateUrl: './promostandard-colors.component.html'
})
export class PromostandardColorsComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['color', 'size', 'quantityAvailable'];
  dataSource = [];
  dummyDataSource = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getColors(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((colors) => {
        console.log("colors", colors["data"])

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getPromoStandardInventory()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.dataSource = response["data"]["result"];
        this.dummyDataSource = this.dataSource;
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  searchKeyword(event): void {
    const value = event.target.value;

    this.dataSource = this.dummyDataSource.filter((item: any) => {
      return item.attributeColor.toLowerCase().includes(value.toLowerCase()) || item.attributeSize.toLowerCase().includes(value.toLowerCase());
    });
  }

}
