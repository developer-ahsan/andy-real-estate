import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html'
})
export class RelatedProdcutsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isCurrentLoading: boolean = false;

  relationTypes = [];
  isUpdateLoading: boolean = false;
  storeData: any;
  mainScreen: string = 'Related Products';

  currentRelatedProduct = [];
  currentRelatedProductColumns: string[] = ['select', 'number', 'name', 'type'];
  currentRelatedTotal = 0;
  currentRelatedPage = 1;

  relatedProduct = [];
  relatedProductColumns: string[] = ['id', 'number', 'name', 'type', 'action'];
  relatedProductTotal = 0;
  relatedProductPage = 1;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this._storeService.store$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeData = res["data"][0];
    });
    this.isLoading = true;
    this.getRelatedProducts(1);
  }
  calledScreen(value) {
    this.mainScreen = value;
    if (value == 'Current Related Products') {
      if (this.currentRelatedProduct.length == 0) {
        this.isLoadingChange.emit(true);
        this.isCurrentLoading = true;
        this.getCurrentRelatedProducts(1);
      }
    }
  }
  getProductRelationTypes() {
    let params = {
      relation_type: true
    }
    this._storeService.commonGetCalls(params).subscribe(res => {
      this.relationTypes = res["data"];
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getRelatedProducts(page) {
    let params = {
      related_product: true,
      store_id: this.storeData.pk_storeID,
      page: page
    }
    this._storeService.commonGetCalls(params).subscribe(res => {
      if (this.relationTypes.length == 0) {
        this.getProductRelationTypes();
      } else {
        this.isLoadingChange.emit(false);
        this.isLoading = false;
      }
      this.relatedProductTotal = res["TotalRequests"];
      this.relatedProduct = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getCurrentRelatedProducts(page) {
    let params = {
      current_related_product: true,
      store_id: this.storeData.pk_storeID,
      page: page
    }
    this._storeService.commonGetCalls(params).subscribe(res => {
      this.currentRelatedProduct = res["data"];
      this.currentRelatedTotal = res["TotalRequests"];

      this.isLoadingChange.emit(false);
      this.isCurrentLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isCurrentLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  UpdatePermaLink() {
    // this.isUpdateLoading = true;
    // let payload = {
    //   permalink: this.permalink,
    //   storeProductID: Number(this.selectedProduct.pk_storeProductID),
    //   update_permalink: true
    // }
    // this._storeService.UpdatePermaLink(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   this.isUpdateLoading = false;
    //   this._storeService.snackBar('Shipping Options Updated Successfully');
    //   this.selectedProduct.permalink = this.permalink;
    //   this._storeService._storeProduct.next(this.selectedProduct);
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   this.isUpdateLoading = false;
    //   this._changeDetectorRef.markForCheck();
    // })
  }

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.relatedProductPage++;
    } else {
      this.relatedProductPage--;
    };
    this.getRelatedProducts(this.relatedProductPage);
  };
  getNextCurrentData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.currentRelatedPage++;
    } else {
      this.currentRelatedPage--;
    };
    this.getCurrentRelatedProducts(this.currentRelatedPage);
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
