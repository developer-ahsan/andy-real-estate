import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-product-options',
  templateUrl: './product-options.component.html'
})
export class ProductOptionsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  storeData: any;



  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getProductOptions();
  }

  getProductOptions() {
    let params = {
      product_options: true,
      store_product_id: Number(this.selectedProduct.pk_storeProductID)
    }
    this._storeService.commonGetCalls(params).subscribe(res => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
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
