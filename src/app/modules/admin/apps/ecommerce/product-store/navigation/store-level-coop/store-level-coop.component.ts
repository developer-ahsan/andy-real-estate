import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-store-level-coop',
  templateUrl: './store-level-coop.component.html'
})
export class StoreLevelCoopComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  cooplist: any;
  coOpId: Number;
  isUpdateLoading: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    if (this.selectedProduct.fk_coopID) {
      this.coOpId = this.selectedProduct.fk_coopID;
    } else {
      this.coOpId = 0;
    }
    this.isLoading = true;
    this.getStoreCoop();
  }

  getStoreCoop() {
    let params = {
      store_level_coop: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.cooplist = res["data"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  UpdateStoreLevelCoop() {
    if (this.coOpId == 0) {
      this.coOpId = null;
    }
    this.isUpdateLoading = true;
    let payload = {
      storeName: this.selectedProduct?.storeName,
      coOpId: Number(this.coOpId),
      update_store_coop: true,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      product_id: Number(this.selectedProduct.fk_productID)
    }
    this._storeService.UpdateStoreLevelCoop(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar('Store Level Coop Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
