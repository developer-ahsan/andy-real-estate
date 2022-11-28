import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { ProductsDetails } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-products-status',
  templateUrl: './products-status.component.html'
})
export class ProductsStatusComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isStoreLoader: boolean = false;
  allStoresSelected = [];
  storesData = [];
  totalStoresData = 0;
  page = 0;
  // Boolean
  isRapidBuild: boolean;
  allSelected = false;
  isCopyImage = false;

  // Assigned Stores
  assignedStores = [];
  imgUrl = environment.productMedia;
  selectedTermUpdateLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.isRapidBuild = true;
    this.isLoading = true;
    this.getAssignedStores();
  }
  getAssignedStores() {
    let params = {
      store_version: true,
      product_id: this.selectedProduct.pk_productID,
      size: 40
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.assignedStores = res["data"];
      this.getAllActiveStores(0);
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getAllActiveStores(page) {
    this.isStoreLoader = true;
    this.page = page + 1;
    let exlcude_list_product = [];
    this.assignedStores.forEach(element => {
      exlcude_list_product.push(element.pk_storeID);
    });
    let params = {
      stores_list: true,
      bln_active: 1,
      size: 20,
      page: this.page,
      exclude_list: exlcude_list_product.toString()
    }
    this._inventoryService.getAllActiveStores(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((stores) => {
        this.isStoreLoader = true;
        this.storesData = this.storesData.concat(stores["data"]);
        this.totalStoresData = stores["totalRecords"];
        this._changeDetectorRef.markForCheck();
        this.isLoadingChange.emit(false);
      }, err => {
        this.isStoreLoader = true;
        this._changeDetectorRef.markForCheck();
        this.isLoadingChange.emit(false);
      });
  }

  addStoreProduct() {
    this.selectedTermUpdateLoader = true;
    let params = {
      store_id: [],
      product_id: this.selectedProduct.pk_productID,
      add_store_product: true
    }
  }
  assignStore(): void {
  }

  selectAll(): void {
    this.allSelected = !this.allSelected;
    this.allStoresSelected = this.allSelected ? this.storesData.map(function (item) {
      return item;
    }) : [];

    this._changeDetectorRef.markForCheck();
  };
  checkOrRemoveChcekBoxes(event) {

  }
  rapidBuildToggle(): void {
    this.isRapidBuild = !this.isRapidBuild;

    this._changeDetectorRef.markForCheck();
  };

  copyImageToggle(): void {
    this.isCopyImage = !this.isCopyImage;

    this._changeDetectorRef.markForCheck();
  };

}
