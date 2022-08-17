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


  inventoryColors: string[];
  inventorySizes: string[];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID, productNumber } = this.selectedProduct;

    const prodNumber = productNumber ? productNumber.substr(0, productNumber.indexOf('_')) : "L455";

    this._inventoryService.getPromoStandardInventory(prodNumber)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        if (response["data"]["success"]) {
          this._inventoryService.getColorsAndSize(pk_productID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inventory) => {
              let promos = response["data"]["result"]["ProductVariationInventoryArray"];
              let tempArray = [];
              for (const promo of promos) {
                const { quantityAvailable } = promo;
                if (quantityAvailable != 0) {
                  tempArray.push(promo);
                }
              };

              let colors = inventory["color"];
              let sizes = inventory["size"];

              this.inventoryColors = colors.length ? colors.map(value => value["colorName"]) : [];
              this.inventorySizes = sizes.length ? sizes.map(value => value["sizeName"]) : [];

              if (this.inventoryColors.length) {
                tempArray = tempArray.filter(i => this.inventoryColors.includes(i.attributeColor));
              };

              if (this.inventorySizes.length) {
                tempArray = tempArray.filter(i => this.inventorySizes.includes(i.attributeSize));
              };

              this.dataSource = tempArray;
              this.dummyDataSource = this.dataSource;

              this.isLoadingChange.emit(false);
              // Mark for check
              this._changeDetectorRef.markForCheck();
            }, err => {
              this.isLoadingChange.emit(false);

              // Mark for check
              this._changeDetectorRef.markForCheck();
            });
        } else {
          this.dataSource = [];
          this.dummyDataSource = [];

          this.isLoadingChange.emit(false);
          // Mark for check
          this._changeDetectorRef.markForCheck();
        }

      }, err => {
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
