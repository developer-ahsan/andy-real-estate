import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { removeStoreProduct } from '../../store.types';
import { AuthService } from 'app/core/auth/auth.service';
import * as CryptoJS from 'crypto-js';
import { Router } from '@angular/router';

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
  user: any;
  ngPassword: any = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _router: Router,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
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
      remove_from_store: true
    }
    this._storeService.commonGetCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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

  UpdateRemoveFromStore() {
    if (this.ngPassword == '') {
      this._storeService.snackBar('Password is required.');
      return;
    }
    const { bundlesCheck, campaignCheck, ordersCheck, recommCheck } = this.removeProductData;
    if (recommCheck != 0 || ordersCheck != 0 || campaignCheck != 0 || bundlesCheck != 0) {
      if (recommCheck != 0) {
        this._storeService.snackBar('ERROR: Product is featured/most popular/primary recommendation in at least one category.');
      } else if (ordersCheck != 0) {
        this._storeService.snackBar('ERROR: Product is connected to an order.');
      } else if (campaignCheck != 0) {
        this._storeService.snackBar('ERROR: The product is featured in at least one campaign.');
      } else if (bundlesCheck != 0) {
        this._storeService.snackBar('ERROR: The product is included in at least one bundle.');
      }
      return;
    }
    let obj = {
      email: this.user.email,
      password: this.ngPassword
    }
    const secretKey = 'remove_from_store';
    const objectString = JSON.stringify(obj);
    const encryptedObject = CryptoJS.AES.encrypt(objectString, secretKey).toString();
    this.isUpdateLoading = true;
    let payload: removeStoreProduct = {
      storeName: this.selectedProduct?.storeName,
      payload: encryptedObject,
      remove_store_product: true,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      productID: Number(this.selectedProduct.fk_productID)
    }
    this._storeService.putStoresProductData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar(res["message"]);
      if (res["isPasswordCorrect"]) {
        this._router.navigate(['apps/ecommerce/inventory/' + this.selectedProduct["fk_productID"] + '/store-versions']);
      }
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
