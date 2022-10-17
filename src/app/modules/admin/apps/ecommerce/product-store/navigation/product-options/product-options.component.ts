import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-product-options',
  templateUrl: './product-options.component.html'
})
export class ProductOptionsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  storeData: any;
  searchTerm: string = '';

  productOptionTotal: Number = 0;

  productsList = [];
  productsListColumns: string[] = ['select', 'id', 'number', 'name'];
  productListTotal: Number = 0;
  productListPage = 1;
  tempProductsList = [];
  tempProductListTotal: Number = 0;

  checkedProductsList = [];


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this._storeService.store$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeData = res["data"][0];
      this.getProductList(1);
    });
    this.isLoading = true;
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
      store_id: Number(this.storeData.pk_storeID)
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
      this.checkedProductsList.push(item);
    } else {
      this.checkedProductsList.splice(check, 1);
    }
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
