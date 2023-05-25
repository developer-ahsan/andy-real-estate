import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-extrinsic-categories',
  templateUrl: './extrinsic-categories.component.html'
})
export class ExtrinsicComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  extrinsicCat: string = '';
  isUpdateLoading: boolean = false;

  extrinsicValues = ['Apparel', 'Awards', 'Bags', 'Display Materials', 'Drinkware', 'Food', 'Fulfillment', 'Giveaways', 'Masks', 'Office Supplies', 'Pins/Name Tags', 'Specialty', 'Technology Items', 'Other'];
  ngExtrinsic = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      let index = this.extrinsicValues.findIndex(item => item == this.selectedProduct.extrinsicCategory);
      if (index == -1) {
        this.ngExtrinsic = 'Other';
        this.extrinsicCat = this.selectedProduct.extrinsicCategory;
      } else {
        this.ngExtrinsic = this.extrinsicValues[index];
      }
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  UpdateExtrinsicCategory() {
    let cat;
    if (this.ngExtrinsic == 'Other') {
      cat = this.extrinsicCat;
    } else {
      cat = this.ngExtrinsic;
    }
    this.isUpdateLoading = true;
    let payload = {
      extrinsicCategory: cat,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_extrinsic_category: true
    }
    this._storeService.UpdateExtrinsicCategory(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar('Extrinsic Category Updated Successfully');
      this.selectedProduct.extrinsicCategory = cat;
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
