import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddSubCategoryKeyword, DeleteSubCategory, RemoveSubCategoryFeatureImage, RemoveSubCategoryKeyword, UpdateSubCategory, addSubCategoryProducts, createSubCategoryFeatureImage, removeSubCategoryProducts, updateSubCatProductDisplayOrder, updateSubCategoriesDisplayOrder, updateSubCategoriesStatus, updateSubCategoryFeatureImage } from '../../../stores.types';

@Component({
  selector: 'app-product-sub-categories',
  templateUrl: './product-sub-categories.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})

export class ProductSubCategoriesComponent implements OnInit, OnDestroy {
  @Input() subCatData: any;
  @Input() subCategories: any;
  @Input() dataSource: any;
  selectedStore: any;
  isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();


  mainScreen: string = "Edit Category";
  screens = [
    "Edit Category",
    "Display Order",
    "Online Status",
    "Product Display Order",
    "Keywords",
    "Subcategory Feature Image"
  ];

  // FeatureImages
  featureScreen = 'Current Images';

  updateStatusLoader: boolean = false;
  updateOrderLoader: boolean = false;
  addCategoryForm: FormGroup;
  addCategoryLoader: boolean = false;

  // Update Category
  isUpdateCatLoader: boolean = false;
  updateCatForm: FormGroup;
  // keywords
  keywordsList: any = [];
  isKeywordLoader: boolean = false;
  ngKeyword: string = '';
  isAddKeyword: boolean = false;
  isRemoveKeywordLoader: boolean = false;
  // Feature images
  isFeatureImageLoader: boolean;
  featureImages = [];
  addFeatureForm: FormGroup;
  isAddFeatureLoader: boolean = false;
  featureImageValue: any;
  isEditFeatureImage: boolean = false;
  isEditFeatureImageData: any;
  isUpdateFeatureImageLoader: boolean = false;
  updateFeatureForm: FormGroup;
  // Product Display Order
  isProductDisplayLoader: boolean = false;
  productsDisplayList = [];
  isProductDisplayUpdate: boolean = false;
  isProductDisplayMoreLoader: boolean = false;
  totalDisplayProds = 0;
  displayProdsPage = 1;
  // Cat Prods
  totalProds = 0;
  prodsPage = 1;
  productsList = [];
  isProductLoader: boolean = false;
  isProductLoaderMore: boolean = false;

  allCatProds = [];
  searchCatProdCtrl = new FormControl();
  selectedCatProd: any;
  isSearchingCatProd = false;
  isCategoryAddProdLoader: boolean = false;

  selectedProducts = [];

  isAddProductLoader: boolean = false;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.getStoreDetails();
  };
  initialize() {
    this.updateCatForm = new FormGroup({
      category_id: new FormControl(2213),
      subCategoryID: new FormControl(''),
      subCategoryName: new FormControl('', Validators.required),
      subCategoryDesc: new FormControl('', Validators.required),
      browserTitle: new FormControl(''),
      metaDesc: new FormControl('', Validators.required),
      permalink: new FormControl('', Validators.required)
    });
    this.updateCatForm.patchValue(this.subCatData);
    this.updateCatForm.patchValue({
      category_id: this.subCatData.fk_categoryID,
      subCategoryID: this.subCatData.pk_subCategoryID
    });
    this.addFeatureForm = new FormGroup({
      buttonURL: new FormControl(),
      displayOrder: new FormControl(),
      blnNewWindow: new FormControl(false),
      headerCopy: new FormControl(),
      buttonCopy: new FormControl(),
      align: new FormControl(0),
      headerCopyColor: new FormControl(),
      buttonBackgroundColor: new FormControl(),
      buttonColor: new FormControl(),
      arrowColor: new FormControl()
    });
    this.updateFeatureForm = new FormGroup({
      buttonURL: new FormControl(),
      displayOrder: new FormControl(),
      blnNewWindow: new FormControl(false),
      headerCopy: new FormControl(),
      buttonCopy: new FormControl(),
      align: new FormControl(0),
      headerCopyColor: new FormControl(),
      buttonBackgroundColor: new FormControl(),
      buttonColor: new FormControl(),
      arrowColor: new FormControl()
    });
    this.getProductList(1);
    let params;
    this.searchCatProdCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          subcategory_available_products: true,
          store_id: this.selectedStore.pk_storeID,
          sub_category_id: this.subCatData.pk_subCategoryID,
          keyword: res
        }
        return res !== null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allCatProds = [];
        this.isSearchingCatProd = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._storeManagerService.getStoresData(params)
        .pipe(
          finalize(() => {
            this.isSearchingCatProd = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allCatProds = data['data'];
    });
  }
  backToMainScreen() {
    this._storeManagerService.isEditSubCategory = false;
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.getCategoryProducts();

      });
  }
  calledScreen(screenName): void {
    this.mainScreen = screenName;
    if (screenName == 'Keywords') {
      this.getKeywords();
    } else if (screenName == 'Subcategory Feature Image') {
      this.getFeatureImages();
    } else if (screenName == 'Product Display Order') {
      this.getProductDisplayList(1);
    }
  };
  calledFeatureScreen(screen) {
    this.featureScreen = screen;
  }
  // Update Category
  updateCategory() {
    const { category_id, subCategoryID, subCategoryName, subCategoryDesc, browserTitle, metaDesc, permalink } = this.updateCatForm.getRawValue();
    let payload: UpdateSubCategory = {
      category_id: category_id,
      subCategoryID: subCategoryID,
      subCategoryName: subCategoryName,
      subCategoryDesc: subCategoryDesc,
      browserTitle: browserTitle,
      metaDesc: metaDesc,
      permalink: permalink,
      update_subCategory: true
    }
    this.isUpdateCatLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.isUpdateCatLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateCatLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Remove Category
  deleteCategory() {
    let payload: DeleteSubCategory = {
      subCategoryID: 0,
      remove_subCategory: true
    }
    this.subCatData.deleteLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      if (res["success"]) {
        this.backToMainScreen();
      }
      this.subCatData.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.subCatData.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Update DisplayOrder
  updateDisplayOrder() {
    let SubCategories = [];
    this.subCategories.forEach(element => {
      SubCategories.push({
        subCategoryID: element.pk_subCategoryID,
        list_order: element.listOrder
      });
    });
    let payload: updateSubCategoriesDisplayOrder = {
      subCategories: SubCategories,
      update_subCategory_list_order: true
    }
    this.subCatData.displayLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.subCatData.displayLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.subCatData.displayLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update OnlineStatus
  updateOnlineStatus() {
    let SubCategories = [];
    this.subCategories.forEach(element => {
      SubCategories.push({
        subCategory_id: element.pk_subCategoryID,
        bln_active: element.blnActive
      });
    });
    let payload: updateSubCategoriesStatus = {
      subCategories: SubCategories,
      category_id: this.subCatData.fk_categoryID,
      update_subCategory_status: true
    }
    this.subCatData.statusLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.subCatData.statusLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.subCatData.statusLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Keywords
  getKeywords() {
    this.isKeywordLoader = true;
    let params = {
      categories_keywords: true,
      subcategory_id: this.subCatData.pk_subCategoryID,
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.keywordsList = res["data"];
      this.isKeywordLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isKeywordLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addKeywords() {
    if (this.keywordsList.length == 10) {
      this._storeManagerService.snackBar('You cannot add more than ten keywords for a category.');
      return;
    }
    this.isAddKeyword = true;
    let payload: AddSubCategoryKeyword = {
      sub_category_id: this.subCatData.pk_subCategoryID,
      keyword: this.ngKeyword,
      add_subcategory_keyword: true
    }
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.ngKeyword = '';
      }
      this.getKeywords();
      this.isAddKeyword = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddKeyword = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  deleteKeyword(item) {
    let payload: RemoveSubCategoryKeyword = {
      keyword_id: this.subCatData.pk_keywordID,
      delete_subcategory_keyword: true
    }
    item.deleteLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      if (res["success"]) {
        let index = this.keywordsList.findIndex(keyword => keyword.pk_keywordID == item.pk_keywordID);
        this.keywordsList.splice(index, 1);
      }
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Feature Images
  getFeatureImages() {
    this.isFeatureImageLoader = true;
    let params = {
      subCategory_feature_images: true,
      subCategory_id: this.subCatData.pk_subCategoryID,
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.featureImages = res["data"];
      this.isFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addFeatureImage() {
    this.isAddFeatureLoader = true;
    const { buttonURL, displayOrder, blnNewWindow, headerCopy, buttonCopy, align, headerCopyColor, buttonBackgroundColor, buttonColor, arrowColor } = this.addFeatureForm.getRawValue();
    let payload: createSubCategoryFeatureImage = {
      subCategory_id: Number(this.subCatData.pk_subCategoryID),
      buttonURL: buttonURL,
      displayOrder: Number(displayOrder),
      blnNewWindow: blnNewWindow,
      headerCopy: headerCopy,
      buttonCopy: buttonCopy,
      align: Number(align),
      headerCopyColor: headerCopyColor,
      buttonBackgroundColor: buttonBackgroundColor,
      buttonColor: buttonColor,
      arrowColor: arrowColor,
      add_subCategory_feature_image: true
    }
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.addFeatureForm.reset();
        this.featureScreen = 'Current Images';
        if (this.featureImageValue) {
          this.uploadFeatureImage(res["newFeatureImageID"]);
        }
        this.getFeatureImages();
      }
      this.isAddFeatureLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddFeatureLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadImage(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 1500 || image.height != 300) {
          this._snackBar.open("Dimensions allowed are 1500px x 300px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.featureImageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.featureImageValue = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }
    };
  };
  uploadFeatureImage(id) {
    const base64 = this.featureImageValue.imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/subcategory/featureImages/${this.subCatData.pk_subCategoryID}/${id}.jpg`
    };
    this._storeManagerService.addMedia(payload)
      .subscribe((response) => {
        this.featureImageValue = null;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  deleteFeatureImages(item) {
    let payload: RemoveSubCategoryFeatureImage = {
      subCategory_feature_image_id: item.pk_subCategoryFeatureImageID,
      delete_category_feature: true
    }
    item.deleteLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      if (res["success"]) {
        let index = this.featureImages.findIndex(feature => feature.pk_subCategoryFeatureImageID == item.pk_subCategoryFeatureImageID);
        this.featureImages.splice(index, 1);
      }
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  editFeatureImage(item) {
    this.isEditFeatureImage = true;
    this.isEditFeatureImageData = item;
    this.updateFeatureForm.patchValue(item);
  }
  closeEditFeatureImage() {
    this.isEditFeatureImage = false;
  }
  updateFeatureImage() {
    this.isUpdateFeatureImageLoader = true;
    const { buttonURL, displayOrder, blnNewWindow, headerCopy, buttonCopy, align, headerCopyColor, buttonBackgroundColor, buttonColor, arrowColor } = this.updateFeatureForm.getRawValue();
    let payload: updateSubCategoryFeatureImage = {
      subCategory_feature_image_id: this.isEditFeatureImageData.pk_subCategoryFeatureImageID,
      buttonURL: buttonURL,
      displayOrder: Number(displayOrder),
      blnNewWindow: blnNewWindow,
      headerCopy: headerCopy,
      buttonCopy: buttonCopy,
      align: Number(align),
      headerCopyColor: headerCopyColor,
      buttonBackgroundColor: buttonBackgroundColor,
      buttonColor: buttonColor,
      arrowColor: arrowColor,
      image_url: null,
      update_subCategory_feature_image: true
    }
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      if (this.featureImageValue) {
        this.uploadFeatureImage(this.isEditFeatureImageData.pk_subCategoryFeatureImageID);
      }
      this.isUpdateFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Product DisplayOrder
  getProductDisplayList(page) {
    let params = {
      subcategory_products_display_order: true,
      subcategory_id: this.subCatData.pk_subCategoryID,
      page: page
    }
    if (page == 1) {
      this.isProductDisplayLoader = true;
      this.productsDisplayList = [];
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.productsDisplayList = this.productsDisplayList.concat(res["data"]);
      this.totalDisplayProds = res["totalRecords"];
      this.isProductDisplayLoader = false;
      this.isProductDisplayMoreLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isProductDisplayLoader = false;
      this.isProductDisplayMoreLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextProductDisplayData() {
    this.displayProdsPage++;
    this.isProductDisplayMoreLoader = true;
    this.getProductDisplayList(this.displayProdsPage);
  }
  updateProductDisplayOrder() {
    let storeProducts = [];
    this.productsDisplayList.forEach(element => {
      storeProducts.push({
        store_produt_id: element.pk_storeProductID,
        list_order: element.listOrder
      });
    });
    let payload: updateSubCatProductDisplayOrder = {
      storeProducts: storeProducts,
      subCategory_id: this.subCatData.pk_subCategoryID,
      update_display_order: true
    }
    this.isProductDisplayUpdate = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.isProductDisplayUpdate = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isProductDisplayUpdate = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Cat Products
  getProductList(page) {
    let params = {
      subcategory_products: true,
      sub_category_id: this.subCatData.pk_subCategoryID,
      page: page
    }
    if (page == 1) {
      this.isProductLoader = true;
      this.productsList = [];
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.productsList = this.productsDisplayList.concat(res["data"]);
      this.totalProds = res["totalRecords"];
      this.isProductLoader = false;
      this.isProductLoaderMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isProductLoader = false;
      this.isProductLoaderMore = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextProductData() {
    this.prodsPage++;
    this.isProductLoaderMore = true;
    this.getProductList(this.prodsPage);
  }
  removeProducts() {
    let store_product_ids = [];
    this.productsList.forEach(element => {
      if (element.select)
        store_product_ids.push(element.pk_storeProductID);
    });
    let payload: removeSubCategoryProducts = {
      store_product_ids: store_product_ids,
      category_id: this.subCatData.fk_categoryID,
      subCategory_id: this.subCatData.pk_subCategoryID,
      remove_subCategory_products: true
    }
    this.subCatData.removeLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.subCatData.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.subCatData.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getCategoryProducts() {
    let params = {
      subcategory_available_products: true,
      store_id: this.selectedStore.pk_storeID,
      sub_category_id: this.subCatData.pk_subCategoryID
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allCatProds = res['data'];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  onSelected(ev) {
    this.selectedCatProd = ev.option.value;
    if (this.selectedProducts.length == 0) {
      this.selectedProducts.push(this.selectedCatProd);
    } else {
      let index = this.selectedProducts.findIndex(prod => prod.fk_productID == this.selectedCatProd.fk_productID);
      if (index == -1) {
        this.selectedProducts.push(this.selectedCatProd);
      }
    }
  }
  displayWith(value: any) {
    return value?.productName;
  }
  removeProduct(i) {
    this.selectedProducts.splice(i, 1);
  }
  addSubCatProds() {
    let storeProducts = [];
    this.selectedProducts.forEach(element => {
      storeProducts.push(element.pk_storeProductID);
    });
    let payload: addSubCategoryProducts = {
      store_product_ids: storeProducts,
      subCategory_id: this.subCatData.pk_subCategoryID,
      add_subCategory_products: true
    }
    this.isAddProductLoader = true;
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isAddProductLoader = false;
      this._storeManagerService.snackBar(res["message"]);
      this.selectedProducts = [];
      this.getProductList(1);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddProductLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
