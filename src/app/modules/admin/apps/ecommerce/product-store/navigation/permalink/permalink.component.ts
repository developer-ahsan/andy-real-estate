import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

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
    private _storeService: StoreProductService,
    private _commonService: DashboardsService
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
    let permalink = this.permalink;
    if (!this.permalink) {
      permalink = this._commonService.convertToSlug(this.selectedProduct.productName);
    }
    let payload = {
      permalink: permalink,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_permalink: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    if (!payload.permalink) {
      this._commonService.snackBar('Permalink should be empty or any value');
      return;
    }
    this.isUpdateLoading = true;
    this._storeService.UpdatePermaLink(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      if (res) {
        this._storeService.snackBar(res["message"]);
      }
      this.selectedProduct.permalink = permalink;
      this.permalink = permalink;
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
