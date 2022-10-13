import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-shipping',
  templateUrl: './shipping.component.html'
})
export class ShippingComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnOverride: boolean = false;
  blnIncludeShipping: boolean = false;
  isUpdateLoading: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getShipping();
  }

  getShipping() {
    let params = {
      shipping: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.blnOverride = true;
        this.blnIncludeShipping = res["data"][0].blnIncludeShipping;
      } else {
        this.blnOverride = false;
        this.blnIncludeShipping = false;
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  updateShipping() {
    this.isUpdateLoading = true;
    let payload = {
      blnOverride: this.blnOverride,
      blnIncludeShipping: this.blnIncludeShipping,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_shipping: true
    }
    this._storeService.updateShipping(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar('Shipping Options Updated Successfully');
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
