import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-permalink',
  templateUrl: './permalink.component.html'
})
export class PermalinkComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  permalink: string = '';
  isUpdateLoading: boolean = false;

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
      this.permalink = this.selectedProduct.permalink;
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  UpdatePermaLink() {
    this.isUpdateLoading = true;
    let payload = {
      permalink: this.permalink,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_permalink: true
    }
    this._storeService.UpdatePermaLink(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar('Shipping Options Updated Successfully');
      this.selectedProduct.permalink = this.permalink;
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
