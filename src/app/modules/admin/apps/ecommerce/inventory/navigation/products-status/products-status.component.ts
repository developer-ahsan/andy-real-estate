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

  emails: string[] = ["albert.eiein@gmail.com", "leodo_da_v@hotmail.com",
    "jagadish_cdrae@yahoo.com", "alan_turing@yahoo.com", "srini.ujan@gmail.com",
    "bjarne_trup@yahoo.com", "max.planck@gmail.com", "nikola.tesa@hotmail.com",
    "galileo_galei@hotmail.com", "a.p.j.abdul.am@gmail.com", "richard.stlman@inbox.com", "devin.gu@yandex.com", "albert.eiein@gmail.com", "leodo_da_v@hotmail.com",
    "jagadish_cdrae@yahoo.com", "alan_turing@yahoo.com", "srini.ujan@gmail.com",
    "bjarne_trup@yahoo.com", "max.planck@gmail.com", "nikola.tesa@hotmail.com",
    "galileo_galei@hotmail.com", "a.p.j.abdul.am@gmail.com", "richard.stlman@inbox.com", "devin.gu@yandex.com"];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    // console.log("selectedProduct => ", this.selectedProduct);
    // this._inventoryService.getProductByProductId(productId)
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((product) => {
    //     this.selectedProduct = product["data"][0];
    //     console.log("product here fetched", this.selectedProduct);
    //     this.isLoading = false;

    //     // Mark for check
    //     this._changeDetectorRef.markForCheck();
    //   });
    this.isLoadingChange.emit(false);
  }

  assignStore(): void {
    console.log("assigned store");
  }

}
