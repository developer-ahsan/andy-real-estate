import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-remove-from-store',
  templateUrl: './remove-from-store.component.html'
})
export class RemoveFromStoreComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  removeProductData: any;
  isUpdateLoading: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getRemoveProductsDetails();
    });
  }
  getRemoveProductsDetails() {
    let params = {
      store_id: this.selectedProduct.fk_storeID,
      store_product_id: this.selectedProduct.pk_storeProductID,
      status_check: true
    }
    this._storeService.removeStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.removeProductData = res["data"][0];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  // UpdateStoreLevelCoop() {
  //   this.isUpdateLoading = true;
  //   let payload = {
  //     storeName: this.selectedProduct?.storeName,
  //     coOpId: Number(this.coOpId),
  //     update_store_coop: true,
  //     storeProductID: Number(this.selectedProduct.pk_storeProductID),
  //     product_id: Number(this.selectedProduct.fk_productID)
  //   }
  //   this._storeService.UpdateStoreLevelCoop(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
  //     this.isUpdateLoading = false;
  //     this._storeService.snackBar('Store Level Coop Updated Successfully');
  //     this._changeDetectorRef.markForCheck();
  //   }, err => {
  //     this.isUpdateLoading = false;
  //     this._changeDetectorRef.markForCheck();
  //   })
  // }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
