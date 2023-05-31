import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { StatusUpdate } from '../../store.types';

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
  offlineReason: any;
  blnSendEmail: boolean = false;
  blnAddToRapidBuild: boolean = false;
  enableButton: boolean = false;
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
      storeProduct_id: this.selectedProduct.pk_storeProductID,
      product_id: this.selectedProduct.fk_productID,
      bln_apparel: this.selectedProduct.blnApparel ? 1 : 0,
      bln_active: this.selectedProduct.blnStoreActive,
      status_check: true
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.statusProductData = res;
      const { FOBCheck, attributeCheck, colorCheck, costsCheck, descCheck, imprintsCheck, licensingTermCheck, marginsCheck, msrpCheck, subCatCheck, sizesCheck } = res["data"][0];
      if (FOBCheck > 0 && attributeCheck > 0 && colorCheck > 0 && costsCheck > 0 && descCheck?.length > 0 && imprintsCheck > 0 && licensingTermCheck > 0 && marginsCheck > 0 && msrpCheck > 0 && subCatCheck) {
        if (this.selectedProduct.blnApparel) {
          if (sizesCheck > 0) {
            this.enableButton = true;
          }
        } else {
          this.enableButton = true;
        }
      }
      console.log(this.enableButton);
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  UpdateStoreStatus(value) {
    this.isUpdateLoading = true;
    let payload: StatusUpdate = {
      bln_active: value,
      store_name: this.selectedProduct?.storeName,
      store_product_id: Number(this.selectedProduct.pk_storeProductID),
      blnSendEmail: this.blnSendEmail,
      blnAddToRapidBuild: this.blnAddToRapidBuild,
      update_status: true
    }
    this._storeService.putStoresProductData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this.selectedProduct.blnStoreActive = value;
      this._changeDetectorRef.markForCheck();
      this._storeService.snackBar(res["message"]);
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
