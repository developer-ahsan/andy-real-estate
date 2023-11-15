import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';
import { UpdateSpecialDescription } from '../../store.types';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-special-description',
  templateUrl: './special-description.component.html'
})
export class SpecialDescComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isUpdateLoading: boolean = false;
  description: string = '';
  miniDescription: string = '';
  metaDescription: string = '';
  descriptionStore: string = '';
  miniDescriptionStore: string = '';
  metaDescriptionStore: string = '';

  stores = [];
  storesTotal = 0;
  storePage = 1;
  storeLoader: boolean = false;
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };
  specialDesc: any;
  response: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private route: ActivatedRoute,
    private _storeService: StoreProductService,
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.isLoading = true;
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      if (res["store_product_descriptions"].length > 0) {
        this.specialDesc = res["store_product_descriptions"][0];
        const { specialDescription, specialMetaDesc, specialMiniDescription } = res["store_product_descriptions"][0];
        this.descriptionStore = specialDescription;
        this.metaDescriptionStore = specialMetaDesc;
        this.miniDescriptionStore = specialMiniDescription;
      }
      this.getDescription();
      this.getStoresVersions(1);
    });
  }
  getDescription() {
    this._inventoryService
      .getProductDescription(this.selectedProduct.fk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((description) => {
        this.description = description["data"][0].productDesc;
        this.miniDescription = description["data"][0].miniDesc;
        this.metaDescription = description["data"][0].metaDesc;
        this.isLoadingChange.emit(false);
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isLoadingChange.emit(false);
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  getStoresVersions(page) {
    this.storeLoader = true;
    let params = {
      page: page,
      special_description_stores: true,
      store_product_id: this.selectedProduct.pk_storeProductID,
      product_id: this.selectedProduct.fk_productID,
      size: 20
    }
    this._storeService
      .getStoreProducts(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.stores = this.stores.concat(res["data"]);
        this.storesTotal = res["totalRecords"];
        this.storeLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.storeLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }

  getNextStore() {
    this.storePage++;
    this.getStoresVersions(this.storePage);
  }
  assignDescriptions(check) {
    if (check == 1) {
      this.descriptionStore = this.description;
    }
    if (check == 2) {
      this.miniDescriptionStore = this.miniDescription;
    }
    if (check == 3) {
      this.metaDescriptionStore = this.metaDescription;
    }
  }

  UpdateSpecialDescription() {
    let stores = [];
    stores.push({
      productID: Number(this.selectedProduct.fk_productID),
      storeProductID: Number(this.selectedProduct.pk_storeProductID)
    });
    this.stores.forEach(element => {
      if (element.checked) {
        stores.push({
          productID: Number(this.selectedProduct.fk_productID),
          storeProductID: Number(element.pk_storeProductID)
        })
      }
    });
    this.isUpdateLoading = true;
    let payload = {
      masterDescription: this.description !== null ? this.description.replace(/'/g, '"') : this.description,
      masterMiniDescription: this.miniDescription !== null ? this.miniDescription.replace(/'/g, '"') : this.description,
      specialDescription: this.descriptionStore !== null ? this.descriptionStore.replace(/'/g, '"') : this.description,
      specialMiniDescription: this.miniDescriptionStore !== null ? this.miniDescriptionStore.replace(/'/g, '"') : this.description,
      specialMetaDescription: this.metaDescriptionStore !== null ? this.metaDescriptionStore.replace(/'/g, '"') : this.description,
      storeProducts: stores,
      storeName: this.selectedProduct.storeName,
      update_special_description: true
    }
    this._storeService.putStoresProductData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      if (res["success"]) {
        this.stores = [];
        this._storeService.getStoreProductsDetail(this.selectedProduct.pk_storeProductID);
        this.getStoresVersions(1);
        this._storeService.snackBar(res["message"]);
      }
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
