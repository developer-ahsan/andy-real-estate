import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-store-colors',
  templateUrl: './colors.component.html',
  styles: ['fuse-alert .fuse-alert-container .mat-icon {color: gray !important} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-message {color: gray !important}'],
  encapsulation: ViewEncapsulation.None,
})
export class StoreColorsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  colorColumns: string[] = ['id', 'name', 'select'];
  colorData = [];

  isUpdateLoading: boolean = false;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.isLoading = true;
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getColors();
    });
  }
  getColors() {
    let params = {
      color: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.colorData = res["data"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  updateColors() {
    this.isUpdateLoading = true;
    let colors: number[] = [];
    this.colorData.forEach(element => {
      if (element.blnStoreProductColorActive) {
        colors.push(element.fk_colorID);
      }
    });
    let payload = {
      colorIDS: colors,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_color: true
    }
    this._storeService.updateColors(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
