import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-extrinsic-categories',
  templateUrl: './extrinsic-categories.component.html'
})
export class ExtrinsicComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  extrinsicCat: string = '';
  isUpdateLoading: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.extrinsicCat = this.selectedProduct.extrinsicCategory;
    this.isLoadingChange.emit(false);
    this.isLoading = false;
    this._changeDetectorRef.markForCheck();
  }

  UpdateExtrinsicCategory() {
    this.isUpdateLoading = true;
    let payload = {
      extrinsicCategory: this.extrinsicCat,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_extrinsic_category: true
    }
    this._storeService.UpdateExtrinsicCategory(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar('Extrinsic Category Updated Successfully');
      this.selectedProduct.extrinsicCategory = this.extrinsicCat;
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
