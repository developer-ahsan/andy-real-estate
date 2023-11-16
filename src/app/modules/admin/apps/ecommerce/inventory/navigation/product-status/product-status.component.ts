import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { UpdateProductStatus } from '../../inventory.types';

@Component({
  selector: 'app-product-status',
  templateUrl: './product-status.component.html'
})
export class ProductStatusComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isDisableProductLoader: boolean = false;
  isActivateProductLoader: boolean = false;
  reason: any = '';
  statusData: any;
  blnCanBeDisabled: boolean;
  emailCheck: boolean = false;
  localStorageData: any;
  images: any = []
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getProductDetail();
    this.getStatusData();
    this.localStorageData = JSON.parse(localStorage.getItem('userDetails'));
  }

  getStatusData() {
    let params = {
      check_disable_status: true,
      product_id: this.selectedProduct.pk_productID,
    }
    this.isLoading = true;
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.statusData = res;
      let productIds = this.statusData.storeProductIDS[0].storeProductIDS.split(',')
      productIds.forEach(item => {
        if (this.storeProductImages(item)) {
          this.images.push({
            storeProductID: item,
            image: `${environment.assetsURL}/globalAssets/Products/HiRes/${item}.jpg`
          })
        } else {
          this.images.push({
            storeProductID: item,
            image: 'https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg'
          })
        }
      })
      this.isLoading = false;
      if (this.statusData?.qryCampaigns.length === 0 && this.statusData?.qryCarts.length === 0 && this.statusData?.qryRecommended.length === 0) {
        this.blnCanBeDisabled = true;
      } else {
        this.blnCanBeDisabled = false;
      }
      this._changeDetectorRef.markForCheck();
    })
  }

  storeProductImages(targetID) {
    let url = `${environment.assetsURL}/globalAssets/Products/HiRes/${targetID}.jpg`
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        resolve();
      };
      img.onerror = () => {
        reject();
      };
    });
  }

  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.isLoading = false;
      }
    });
  }
  disableProduct() {
    if(this.reason === '') {
      this._snackBar.open("Reason for disabling is required field", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.isDisableProductLoader = true;
    let params = {
      productID: this.selectedProduct.pk_productID,
      bln_active: this.selectedProduct.blnActive,
      disabledReason: this.reason,
      is_active: false,
      images: this.images,
      mainLogin_blnSupplier: this.localStorageData.supplier,
      mainLogin_companyName: this.localStorageData.companyName,
      blnEmailProgramManagers: this.localStorageData.blnManager,
      update_master_product_status: true
    };
    this._inventoryService.UpdateProductStatus(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isDisableProductLoader = false;
      this._snackBar.open("Product Disabled Successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.selectedProduct.blnActive = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDisableProductLoader = false;
      this._changeDetectorRef.markForCheck();
    })

  }
  activateProduct() {
    this.isActivateProductLoader = true;
    let params = {
      productID: this.selectedProduct.pk_productID,
      bln_active: this.selectedProduct.blnActive,
      reason: '',
      is_active: true,
      update_product_status: true,
      images: this.images,
      mainLogin_blnSupplier: this.localStorageData.supplier,
      mainLogin_companyName: this.localStorageData.companyName,
      blnEmailProgramManagers: this.localStorageData.blnManager,
      update_master_product_status: true
    };
    this._inventoryService.UpdateProductStatus(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isActivateProductLoader = false;
      this._snackBar.open("Product Activated Successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.selectedProduct.blnActive = true;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isActivateProductLoader = false;
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
