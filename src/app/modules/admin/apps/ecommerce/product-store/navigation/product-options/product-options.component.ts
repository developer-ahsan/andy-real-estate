import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-product-options',
  templateUrl: './product-options.component.html'
})
export class ProductOptionsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  searchTerm: string = '';

  productOptionList = [];
  productOptionTotal: Number = 0;
  productOptionPage = 1;

  productsList = [];
  productsLists = [];
  productsListColumns: string[] = ['select', 'id', 'number', 'name'];
  productListTotal: Number = 0;
  productListPage = 1;
  tempProductsList = [];
  tempProductListTotal: Number = 0;

  checkedProductsList = [];

  isUpdateLoading: boolean = false;

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
      this.getProductList(1);
      this.getProductsOptionsData();
    });
  }
  getProductsOptionsData() {
    let params = {
      product_options_all_calls: true,
      store_id: this.selectedProduct.fk_storeID,
      store_product_id: this.selectedProduct.pk_storeProductID,
      product_id: this.selectedProduct.fk_productID
    }
    this._storeService.commonGetCalls(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      console.log(res);
      if (res["qryProducts"][0].qryProducts) {
        let products = res["qryProducts"][0].qryProducts.split(',,');
        products.forEach(product => {
          const [pk_storeProductID, pk_companyID, companyName, productName, isSelected] = product.split('::');
          if (isSelected == 1) {
            this.productOptionTotal = Number(this.productOptionTotal) + 1;
          }
          this.productsList.push({ pk_storeProductID, pk_companyID, companyName, productName, isSelected })
        });
      }
      console.log(this.productOptionList)
      // this.relationTypes = extractData(res["qryProductRelationTypes"], ',,', 'qryProductRelationTypes');
      // this.selectedRelation = this.relationTypes.length > 0 ? this.relationTypes[0].pk_relationTypeID : null;

      // this.relatedProduct = extractData(res["qryProducts"], ',,', 'qryProducts');

      // this.currentRelatedProduct = extractData(res["qryRelatedProducts"], ',,', 'qryRelatedProducts');
      this._changeDetectorRef.markForCheck();
    });
  }
  searchKeyword(ev) {
    const keyword = ev.target.value;
    this.searchTerm = keyword;
    if (keyword.length > 0) {
      this.productListPage = 1;
      this.getProductList(1);
    } else {
      this.productListPage = 1;
      this.productsList = this.tempProductsList;
      this.productListTotal = this.tempProductListTotal;
    }
  }
  getProductOptions() {
    let params = {
      product_options: true,
      store_product_id: Number(this.selectedProduct.pk_storeProductID)
    }
    this._storeService.commonGetCalls(params).subscribe(res => {
      this.productOptionTotal = res["totalRecords"];
      this.productOptionList = res["data"];
      this.productOptionList.forEach(element => {
        this.productListTotal = Number(this.productListTotal) - 1;
        this.tempProductListTotal = Number(this.tempProductListTotal) - 1;
        element.fk_productID = element.pk_productID;
        element.selected = true;
        const index = this.productsList.findIndex(elem => elem.fk_productID == element.pk_productID);
        this.productsList.splice(index, 1);
        this.checkedListItems(element);
      });
      // this.checkedProductsList = this.productOptionList;
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductList(page) {
    let params = {
      product_options_supplier_products: true,
      page: page,
      keyword: this.searchTerm,
      store_id: Number(this.selectedProduct.fk_storeID)
    }
    this._storeService.commonGetCalls(params).subscribe(res => {
      this.productListTotal = res["totalRecords"];
      this.productsList = res["data"];
      if (this.searchTerm == '') {
        this.tempProductListTotal = res["totalRecords"];
        this.tempProductsList = res["data"];
      }
      this.getProductOptions();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.productListPage++;
    } else {
      this.productListPage--;
    };
    this.getProductList(this.productListPage);
  };

  checkedListItems(item) {
    let check = this.checkedProductsList.findIndex(element => element.fk_productID == item.fk_productID);
    if (check < 0) {
      item.selected = true;
      this.checkedProductsList.push(item);
    } else {
      item.selected = false;
      this.checkedProductsList.splice(check, 1);
    }
  }

  updateProductotpions() {
    this.isUpdateLoading = true;
    let productIDs: number[] = [];
    this.checkedProductsList.forEach(element => {
      productIDs.push(element.fk_productID);
    });
    let payload = {
      optionalGuidelines: '',
      product_id: Number(this.selectedProduct.fk_productID),
      storeName: this.selectedProduct.storeName,
      productIDs: productIDs,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_product_options: true
    }
    this._storeService.UpdateProductOptions(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.checkedProductsList = [];
      this.isUpdateLoading = false;
      this._storeService.snackBar('Store product options updated successfully');
      this.isLoading = true;
      this.getProductList(1);
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
