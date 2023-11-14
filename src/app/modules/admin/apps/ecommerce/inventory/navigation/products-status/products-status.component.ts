import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { AddStoreProduct, ProductsDetails, addRapidBuildStoreProduct } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-products-status',
  templateUrl: './products-status.component.html'
})
export class ProductsStatusComponent implements OnInit {
  selectedProduct: any;
  isLoading: boolean;
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
  ngComment: any;

  checkedStores = [];
  isRapidBuilImageLoader: boolean = false;

  loadAssignedStores: boolean = false;
  totalAssignedStores = 0;
  assignedStorePage = 1;
  tempDate = new Date().toLocaleString();
  ngSelectedStoreToCopy: any;
  blankImgUrl: string;
  hiresImgUrl: string;
  mainImgUrl: string;
  thumbImgUrl: string;
  hires: boolean;
  main: boolean;
  thumb: boolean;
  blank: boolean;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isRapidBuild = true;
    this.isLoading = true;
    this.getProductDetail();
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getAssignedStores('get', 1);
      }
    });
  }
  getAssignedStores(type, page) {
    let params = {
      page: page,
      store_version: true,
      product_id: this.selectedProduct.pk_productID,
      size: 100
    }
    // if (page == 1) {
    //   this.assignedStores = [];
    // } 
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.assignedStores = res["data"];
      if (type == 'add') {
        this._snackBar.open("Product assigned to the store successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.storesData = [];
        this.allStoresSelected = [];
        this.topScroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
        this.selectedTermUpdateLoader = false;
      }
      this.getAllActiveStores(0);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // getNextAssignedStores() {
  //   this.assignedStorePage++;
  //   this.getAssignedStores(1)

  // }
  getAllActiveStores(page) {
    if (page > 0) {
      this.isViewMoreLoader = true;
    }
    this.isStoreLoader = true;
    this.page = page + 1;
    let exlcude_list_product = [];
    this.assignedStores.forEach(element => {
      exlcude_list_product.push(element.fk_storeID);
    });
    let params = {
      stores_list: true,
      bln_active: 1,
      size: 100,
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
        this.isLoading = false;
      }, err => {
        this.isStoreLoader = true;
        this.isViewMoreLoader = false;
        this._changeDetectorRef.markForCheck();
        this.isLoading = false;
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
    if (!this.isCopyImage) {
      this.ngSelectedStoreToCopy = null;
    }
    this.selectedTermUpdateLoader = true;
    let payload: AddStoreProduct = {
      store_id: pk_storeID,
      product_id: this.selectedProduct.pk_productID,
      blnAddToRapidBuild: this.isRapidBuild,
      rapidBuildComments: this.ngComment || null,
      blnCopy: this.isCopyImage,
      copyImageStoreProductID: this.ngSelectedStoreToCopy,
      add_store_product: true
    }
    this._inventoryService.AddStoreProduct(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.ngComment = null;
      this.getAssignedStores('add', 1);
      if (this.isCopyImage) {
        let targetIDs = [];
        res["newStoreProductIds"].forEach(element => {
          targetIDs.push(element.storeProductID);
        });
        this.storeProductImages(targetIDs);
      }
      // this.selectedTermUpdateLoader = false;
      // this.addRapidStoreProduct(res);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.selectedTermUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addRapidStoreProduct(ids) {
    let payload = {
      store_product_ids: ids,
      addRapidBuildStoreProduct: true
    }
    this._inventoryService.AddStoreProduct(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.ngComment = null;

      this.getAssignedStores('add', 1);
      // this.getAllActiveStores(0);

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
    if (this.assignedStores.length) {
      this.ngSelectedStoreToCopy = this.assignedStores[0].pk_storeProductID;
    }
    this._changeDetectorRef.markForCheck();
  };
  addRapidBuildImages() {
    if (this.checkedStores.length == 0) {
      this._snackBar.open("Please select atleast one store", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.isRapidBuilImageLoader = true;
    let paylaod = {
      store_product_ids: this.checkedStores,
      addRapidBuildStoreProduct: true
    }
    this._inventoryService.AddRapidBuildImages(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.checkedStores.forEach(element => {
        this.assignedStores.filter(item => {
          if (item.pk_storeProductID == element) {
            item.checked = false;
          }
        })
      });
      this.checkedStores = [];
      this._snackBar.open(res["message"], '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.isRapidBuilImageLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRapidBuilImageLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  storeCheckToggle(item) {
    let index = this.checkedStores.findIndex(elem => item.pk_storeProductID == elem);
    if (index >= 0) {
      item.checked = false;
      this.checkedStores.splice(index, 1);
    } else {
      item.checked = true;
      this.checkedStores.push(item.pk_storeProductID);
    }
  }
  storeProductImages(targetIDs) {
    let Types = [];
    const imageTypes = ['Images', 'Thumbnails', 'HiRes', 'Swatch', 'BlankImages'];
    const checkIfImageExists = (url, type) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = url;

        if (img.complete) {
          Types.push(type);
          resolve();
        } else {
          img.onload = () => {
            Types.push(type);
            resolve();
          };
          img.onerror = () => {
            reject();
          };
        }
      });
    };

    const setImgUrls = (type) => {
      this[`${type}ImgUrl`] = `${environment.assetsURL}/globalAssets/Products/${type}/${this.ngSelectedStoreToCopy}.jpg`;
      console.log(this[`${type}ImgUrl`]);
      return checkIfImageExists(this[`${type}ImgUrl`], type);
    };

    const imagePromises = imageTypes.map((type) => setImgUrls(type));

    Promise.all(imagePromises)
      .then(() => {
        // All images have loaded successfully
        console.log("All images loaded successfully");
        // Call another function and pass Types to it
        this.uploadImages(Types, targetIDs);
      })
      .catch(() => {
        // Handle the case where at least one image failed to load
        this.uploadImages(Types, targetIDs);
        console.log("Some images failed to load");
      });
  }
  uploadImages(type, targetIDs) {
    let payload = {
      targetStoreProductIDs: targetIDs,
      sourceStoreProduct: this.ngSelectedStoreToCopy,
      images: type,
      copy_store_version_images: true
    }
    this._inventoryService.AddStoreProduct(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.clear();
    });
  }

}
