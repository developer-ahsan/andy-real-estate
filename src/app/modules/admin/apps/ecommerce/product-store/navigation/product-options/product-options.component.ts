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


  totalSelectedProds = 0;
  selectedProdsIDs = [];
  guideLinesDesc = '';
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
      let list = [];
      if (res["qryProducts"][0].qryProducts) {
        let products = res["qryProducts"][0].qryProducts.split(',,');
        const parsedData = products.map(item => {
          const details = item.split("::");
          return {
            pid: Number(details[0]),
            id: Number(details[1]),
            code: details[2],
            vendor: details[3],
            productNumber: details[4],
            productName: details[5],
            isSelected: Number(details[6])
          };
        });
        list = this.reformatDataByCode(parsedData);
      }
      this.productOptionList = list;
      this.guideLinesDesc = res["qryMasterDescription"][0].optionsGuidelines;
      this._changeDetectorRef.markForCheck();
    });
  }
  reformatDataByCode(data) {
    this.totalSelectedProds = 0;
    const formattedData = {};

    data.forEach(item => {
      const { code, vendor, ...productDetails } = item;
      if (!formattedData[code]) {
        formattedData[code] = { companyID: Number(code), companyName: vendor, products: [] };
      }
      if (productDetails.isSelected == 1) {
        this.totalSelectedProds++;
        this.selectedProdsIDs.push(productDetails.pid);
      }
      formattedData[code].products.push(productDetails);
    });

    // Sort the data by vendor in ascending order
    const sortedData = Object.values(formattedData).sort((a: any, b: any) => {
      const vendorA = a.companyName.toUpperCase();
      const vendorB = b.companyName.toUpperCase();

      if (vendorA < vendorB) {
        return -1;
      }
      if (vendorA > vendorB) {
        return 1;
      }
      return 0;
    });

    return sortedData;
  }

  selectItem(product) {
    if (product.isSelected) {
      this.selectedProdsIDs.push(product.pid);
    } else {
      this.selectedProdsIDs = this.selectedProdsIDs.filter(id => id !== product.pid);
    }
  }
  updateProductOptions() {
    this.isUpdateLoading = true;
    let payload = {
      optionalGuidelines: this.guideLinesDesc,
      productIDs: this.selectedProdsIDs,
      product_id: this.selectedProduct.fk_productID,
      storeName: this.selectedProduct.storeName,
      storeProductID: this.selectedProduct.pk_storeProductID,
      update_product_options: true
    }
    this._storeService.UpdateProductOptions(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar(res["message"]);
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
