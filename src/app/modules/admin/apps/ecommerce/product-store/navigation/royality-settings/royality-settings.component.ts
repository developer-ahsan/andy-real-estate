import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-royality-settings',
  templateUrl: './royality-settings.component.html'
})
export class RoyalitySettingsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  royaltySetting: number;
  isUpdateLoading: boolean = false;
  storeData: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this._storeService.store$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeData = res["data"][0];
    });
    this.royaltySetting = this.selectedProduct.royaltySetting;
    this.isLoadingChange.emit(false);
    this.isLoading = false;
    this._changeDetectorRef.markForCheck();
  }

  UpdateRoyalty() {
    this.isUpdateLoading = true;
    let payload = {
      royaltySetting: this.royaltySetting,
      storeName: this.storeData.storeName,
      store_product_id: Number(this.selectedProduct.pk_storeProductID),
      product_id: Number(this.selectedProduct.pk_productID),
      update_royalty: true
    }
    this._storeService.UpdateRoyalty(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar('Store product royalty settings updated successfully');
      this.selectedProduct.royaltySetting = this.royaltySetting;
      this._storeService._storeProduct.next(this.selectedProduct);
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
