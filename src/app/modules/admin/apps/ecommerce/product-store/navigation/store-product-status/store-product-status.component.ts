import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-store-product-status',
  templateUrl: './store-product-status.component.html'
})
export class StoreProductStatusComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  removeProductData: any;
  statusProductData: any;
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
      storeProduct_id: this.selectedProduct.pk_storeProductID,
      product_id: this.selectedProduct.fk_productID,
      bln_apparel: this.selectedProduct.blnApparel,
      bln_active: this.selectedProduct.blnStoreActive,
      status_check: true
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res);
      this.statusProductData = res;
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