import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-promostandard-colors',
  templateUrl: './promostandard-colors.component.html'
})
export class PromostandardColorsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['color', 'size', 'quantityAvailable'];
  dataSource = [];
  dummyDataSource = [];
  dataSourceLength: number = 0;

  inventoryColors: string[];
  inventorySizes: string[];
  quantitiesSum: number = 0;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.getProductDetail();
  };
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getPromoStandards();
      }
    });
  }
  getPromoStandards() {
    const { pk_productID, productNumber, fk_supplierID } = this.selectedProduct;

    const prodNumber = productNumber ? productNumber.substr(0, productNumber.indexOf('_')) : "L455";

    this._inventoryService.getPromoStandardInventory(prodNumber, fk_supplierID)
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
              this.dataSourceLength = this.dummyDataSource.length;

              // Total matched quantites sum
              this.quantitiesSum = this.dataSource.length ? this.dataSource.map((item: any) => item["quantityAvailable"]).reduce((prev, next) => prev + next) : 0;

              this.isLoading = false;

              // Mark for check
              this._changeDetectorRef.markForCheck();
            }, err => {
              this.isLoading = false;

              // Mark for check
              this._changeDetectorRef.markForCheck();
            });
        } else {
          this.dataSource = [];
          this.dummyDataSource = [];

          this.isLoading = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        };

      }, err => {
        this.isLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  searchKeyword(event): void {
    const value = event.target.value;

    this.dataSource = this.dummyDataSource.filter((item: any) => {
      return item.attributeColor.toLowerCase().includes(value.toLowerCase()) || item.attributeSize.toLowerCase().includes(value.toLowerCase());
    });
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
