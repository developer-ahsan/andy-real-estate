import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { AddRelatedProduct, DeleteRelatedProduct } from '../../store.types';

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
  selectedRelation = 'COMPATIBLE';
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
  isDelLoader: boolean = false;
  selectedProducts: any; // Use the appropriate type for your products
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
      this.getRelatedProductsData();
    });
  }
  getRelatedProductsData() {
    let params = {
      relation_type_calls: true,
      store_id: this.selectedProduct.fk_storeID,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.commonGetCalls(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      const extractData = (rawData, splitDelimiter, mapping) => {
        if (rawData[0] && rawData[0][mapping]) {
          return rawData[0][mapping].split(splitDelimiter).map(item => {
            const properties = item.split('::');
            return mapping === 'qryProductRelationTypes'
              ? { pk_relationTypeID: properties[0], relationTypeName: properties[1] }
              : mapping === 'qryProducts'
                ? { pk_storeProductID: properties[0], pk_productID: properties[1], productName: properties[2], productNumber: properties[3], storeName: properties[4] }
                : mapping === 'qryRelatedProducts'
                  ? { pk_storeProductID: properties[0], pk_productID: properties[1], productName: properties[2], pk_relationTypeID: properties[3], relationTypeName: properties[4] }
                  : null;
          });
        }
        return [];
      };

      this.relationTypes = extractData(res["qryProductRelationTypes"], ',,', 'qryProductRelationTypes');
      this.selectedRelation = this.relationTypes.length > 0 ? this.relationTypes[0].pk_relationTypeID : null;

      this.relatedProduct = extractData(res["qryProducts"], ',,', 'qryProducts');

      this.currentRelatedProduct = extractData(res["qryRelatedProducts"], ',,', 'qryRelatedProducts');
      this._changeDetectorRef.markForCheck();
    });
  }
  isSelected(item: any): boolean {
    return this.selectedProducts === item;
  }

  selectItem(item: any): void {
    this.selectedProducts = item;
  }
  addRelatedProducts(item) {
    // item.addLoader = true;
    // let payload: AddRelatedProduct = {
    //   store_product_id: Number(item.pk_storeProductID),
    // relatedProductID: Number(item.pk_productID),
    // product_number: string;
    // product_name: string;
    // relation_type_id: this.selectedRelation,
    // storeName: string;
    // add_related_product: true
    // }
    // this._storeService.postStoresProductsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   item.addLoader = false;
    //   this._storeService.snackBar(res["message"]);
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   item.addLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // });
  }
  deleteRelations(item) {
    this.isDelLoader = true;
    let productIDs = [];
    this.currentRelatedProduct.forEach(product => {
      productIDs.push(Number(product.pk_productID))
    });
    if (productIDs.length == 0) {
      this._storeService.snackBar('Please select any product.');
      return;
    }
    let payload: DeleteRelatedProduct = {
      storeProductID: Number(item.pk_storeProductID),
      product_id_list: productIDs,
      product_id: this.selectedProduct.fk_productID,
      storeName: this.selectedProduct.storeName,
      delete_related_product: true
    }
    this._storeService.putStoresProductData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isDelLoader = false;
      this._storeService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isDelLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
