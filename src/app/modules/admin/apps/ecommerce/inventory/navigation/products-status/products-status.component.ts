import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { AddStoreProduct, ProductsDetails } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
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
  @ViewChild('topScrollAnchor') topScroll: ElementRef;

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
  isViewMoreLoader: boolean = false;
  ngComment = '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar
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
    if (page > 0) {
      this.isViewMoreLoader = true;
    }
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
        this.isStoreLoader = false;
        this.isViewMoreLoader = false;

        this.storesData = this.storesData.concat(stores["data"]);
        this.totalStoresData = stores["totalRecords"];
        this._changeDetectorRef.markForCheck();
        this.isLoadingChange.emit(false);
      }, err => {
        this.isStoreLoader = true;
        this.isViewMoreLoader = false;
        this._changeDetectorRef.markForCheck();
        this.isLoadingChange.emit(false);
      });
  }

  addStoreProduct() {
    if (this.allStoresSelected.length == 0) {
      this._snackBar.open("Please select atleast one store", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    let pk_storeID = [];
    this.allStoresSelected.forEach(element => {
      pk_storeID.push(element.pk_storeID);
    });
    if (!this.isRapidBuild) {
      this.ngComment = '';
    }
    this.selectedTermUpdateLoader = true;
    let payload: AddStoreProduct = {
      store_id: pk_storeID,
      product_id: this.selectedProduct.pk_productID,
      blnAddToRapidBuild: this.isRapidBuild,
      rapidBuildComments: this.ngComment,
      add_store_product: true
    }
    this._inventoryService.AddStoreProduct(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.ngComment = '';
      this._snackBar.open("Product assigned to the store successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.storesData = [];
      this.allStoresSelected = [];
      this.getAssignedStores();
      // this.getAllActiveStores(0);
      this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
      this.selectedTermUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.selectedTermUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
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
  checkOrRemoveCheckBoxes(ev, item) {
    const index = this.allStoresSelected.findIndex(elem => elem.storeName == item.storeName);
    if (ev.checked) {
      if (index < 0) {
        this.allStoresSelected.push(item);
      }
    } else {
      if (index >= 0) {
        this.allStoresSelected.splice(index, 1);
      }
    }
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
