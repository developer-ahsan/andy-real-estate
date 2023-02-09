import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { AddRelatedProduct } from '../../store.types';

@Component({
  selector: 'app-related-products',
  templateUrl: './related-products.component.html'
})
export class RelatedProdcutsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isCurrentLoading: boolean = false;

  relationTypes = [];
  isUpdateLoading: boolean = false;
  mainScreen: string = 'Related Products';

  currentRelatedProduct = [];
  currentRelatedProductColumns: string[] = ['select', 'number', 'name', 'type'];
  currentRelatedTotal = 0;
  currentRelatedPage = 1;

  relatedProduct = [];
  relatedProductColumns: string[] = ['id', 'number', 'name', 'type', 'action'];
  relatedProductTotal = 0;
  relatedProductPage = 1;

  isAddLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getRelatedProducts(1);
    });
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
      store_id: this.selectedProduct.fk_storeID,
      page: Number(page)
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
      store_id: this.selectedProduct.fk_storeID,
      page: Number(page)
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
  addRelatedProducts(item) {
    item.addLoader = true;
    let payload: AddRelatedProduct = {
      store_product_id: this.selectedProduct.pk_storeProductID,
      product_id: item.fk_productID,
      product_number: item.productNumber,
      product_name: item.productName,
      relation_type_id: item.prod_type,
      storeName: item.storeName,
      add_related_product: true
    }
    this._storeService.postStoresProductsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.addLoader = false;
      this._storeService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.addLoader = false;
      this._changeDetectorRef.markForCheck();
    })
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
