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
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isDisableProductLoader: boolean = false;
  isActivateProductLoader: boolean = false;
  reason: any = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoading = false;
    this.isLoadingChange.emit(false);
  }

  disableProduct() {
    this.isDisableProductLoader = true;
    let params: UpdateProductStatus = {
      product_id: this.selectedProduct.pk_productID,
      reason: this.reason,
      is_active: false,
      update_product_status: true,
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
    let params: UpdateProductStatus = {
      product_id: this.selectedProduct.pk_productID,
      reason: '',
      is_active: true,
      update_product_status: true,
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
