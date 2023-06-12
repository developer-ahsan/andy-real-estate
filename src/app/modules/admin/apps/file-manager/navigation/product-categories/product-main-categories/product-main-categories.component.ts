import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddCategoryKeyword, AddFeatureImage, RemoveCategory, RemoveCategoryFeatureImage, RemoveCategoryKeyword, UpdateCategory, addToRecommended, createCategoryFeatureImage, updateCategoryFeatureImage, updateCategoryImage, updateRecommededProducts } from '../../../stores.types';

@Component({
  selector: 'app-product-main-categories',
  templateUrl: './product-main-categories.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations
})

export class ProductMainCategoriesComponent implements OnInit, OnDestroy {
  @Input() mainCatData: any;
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['categoryName', 'isRecommended', 'isBestSeller', 'isTopRated', 'subCategories'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  paginatedLoading: boolean = false;

  subCategoriesLoader = false;
  subCategories = [];
  selectedCategory = null;

  activeProductsSum;
  productsCount;

  mainScreen: string = "Edit Category";
  screens = [
    "Edit Category",
    "Feature Images",
    "Category Image",
    "Recommendations",
    "Set Decorator"
  ];

  // FeatureImages
  featureScreen = 'Current Images';

  updateStatusLoader: boolean = false;
  updateOrderLoader: boolean = false;
  addCategoryForm: FormGroup;
  addCategoryLoader: boolean = false;

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

  // Category Image
  isCategoryImageLoader: boolean = false;

  allCatProds = [];
  searchCatProdCtrl = new FormControl();
  selectedCatProd: any;
  isSearchingCatProd = false;
  isCategoryUpdateLoader: boolean = false;

  // Recommendations
  isRecommendationsLoader: boolean = false;
  selectedRecommendedProducts = [];
  recommendedProducts = [];
  recommendedProductsPage = 1;
  recommendedProductTotal = 0;
  recommededKeyword = '';
  recommendedKeywordLoader: boolean = false;
  isAddRecommendeProdsLoader: boolean = false;
  isUpdateRecommendeProdsLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (this.mainCatData) {
      this.initialize();
      this.getStoreDetails();
    }
  };
  backToMainScreen() {
    this._storeManagerService.isEditMainCategory = false;
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.dataSourceLoading = true;
        this.getKeywords();
      });
  }
  initialize() {
    this.updateCatForm = new FormGroup({
      categoryName: new FormControl('', Validators.required),
      permalink: new FormControl('', Validators.required),
      categoryDesc: new FormControl('', Validators.required),
      metaDesc: new FormControl('', Validators.required),
      browserTitle: new FormControl(''),
      blnScroller: new FormControl(false, Validators.required)
    });
    this.updateCatForm.patchValue(this.mainCatData);
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
    let params;
    this.searchCatProdCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          category_image_current_products: true,
          store_id: this.selectedStore.pk_storeID,
          category_id: this.mainCatData.pk_categoryID,
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
      let product = [{
        pk_productID: null, product: 'No Product', pk_storeProductID: null
      }]
      this.allCatProds = product.concat(data['data']);
    });
  }
  calledScreen(screenName): void {
    this.mainScreen = screenName;
    if (screenName == 'Feature Images') {
      if (this.featureImages.length == 0) {
        this.isFeatureImageLoader = true;
        this.getFeatureImages();
      }
    } else if (screenName == 'Category Image') {
      if (this.allCatProds.length == 0) {
        this.isCategoryImageLoader = true;
        this.getCategoryImageProducts();
      }
    } else if (screenName == 'Recommendations') {
      this.getSelectedRecommendations();
    }
  };
  calledFeatureScreen(screen) {
    this.featureScreen = screen;
  }
  // Update Category
  updateCategory() {
    const { categoryName, categoryDesc, browserTitle, metaDesc, permalink, blnScroller } = this.updateCatForm.getRawValue();
    let payload: UpdateCategory = {
      category_id: this.mainCatData.pk_categoryID,
      categoryName: categoryName,
      categoryDesc: categoryDesc,
      categoryMiniDesc: this.mainCatData.categoryMiniDesc,
      browserTitle: browserTitle,
      metaDesc: metaDesc,
      permalink: permalink,
      blnScroller: blnScroller,
      store_id: this.selectedStore.pk_storeID,
      update_category: true
    }
    this.mainCatData.updateLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.mainCatData.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.mainCatData.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Remove Category
  deleteCategory() {
    let payload: RemoveCategory = {
      category_id: this.mainCatData.pk_categoryID,
      delete_category: true
    }
    this.mainCatData.deleteLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      if (res["success"]) {
        this.backToMainScreen();
      }
      this.mainCatData.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.mainCatData.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Keywords
  getKeywords() {
    this.isKeywordLoader = true;
    let params = {
      categories_keywords: true,
      category_id: this.mainCatData.pk_categoryID,
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
    let payload: AddCategoryKeyword = {
      category_id: this.mainCatData.pk_categoryID,
      keyword: this.ngKeyword,
      add_category_keyword: true
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
  // Remove Keyword
  deleteKeyword(item) {
    let payload: RemoveCategoryKeyword = {
      keyword_id: item.pk_keywordID,
      delete_category_keyword: true
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
  getFeatureImages() {
    this.isCategoryImageLoader = true;
    let params = {
      featured_images: true,
      category_id: this.mainCatData.pk_categoryID,
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      // console.log(res);
      this.featureImages = res["data"];
      this.isFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Feature Images
  addFeatureImage() {
    this.isAddFeatureLoader = true;
    const { buttonURL, displayOrder, blnNewWindow, headerCopy, buttonCopy, align, headerCopyColor, buttonBackgroundColor, buttonColor, arrowColor } = this.addFeatureForm.getRawValue();
    let payload: createCategoryFeatureImage = {
      category_id: Number(this.mainCatData.pk_categoryID),
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
      add_category_feature_image: true
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
      image_path: `/globalAssets/Stores/category/featureImages/${this.mainCatData.pk_categoryID}/${id}.jpg`
    };
    this._storeManagerService.addMedia(payload)
      .subscribe((response) => {
        this.featureImageValue = null;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  deleteFeatureImages(item) {
    let payload: RemoveCategoryFeatureImage = {
      feature_image_id: item.pk_categoryFeatureImageID,
      delete_category_feature: true
    }
    item.deleteLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      if (res["success"]) {
        let index = this.featureImages.findIndex(feature => feature.pk_categoryFeatureImageID == item.pk_categoryFeatureImageID);
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
    let payload: updateCategoryFeatureImage = {
      feature_image_id: this.isEditFeatureImageData.pk_categoryFeatureImageID,
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
      update_category_feature_image: true
    }
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      if (this.featureImageValue) {
        this.uploadFeatureImage(this.isEditFeatureImageData.pk_categoryFeatureImageID);
      }
      this.isUpdateFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateFeatureImageLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Category Images
  onSelected(ev) {
    this.selectedCatProd = ev.option.value;
  }
  displayWith(value: any) {
    return value?.product;
  }
  getCategoryImageProducts() {
    this.isCategoryImageLoader = true;
    let params = {
      category_image_current_products: true,
      store_id: this.selectedStore.pk_storeID,
      category_id: this.mainCatData.pk_categoryID
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let product = [{
        pk_productID: null, product: 'No Product', pk_storeProductID: null
      }]
      this.selectedCatProd = product[0];
      this.allCatProds = product.concat(res['data']);
      this.isCategoryImageLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCategoryImageLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateCategoryImage() {
    let storePID;
    if (!this.selectedStore.pk_storeProductID) {
      storePID = this.mainCatData.fk_storeProductCategoryImageID;
    } else {
      storePID = this.selectedStore.pk_storeProductID;
    }
    let payload: updateCategoryImage = {
      store_product_category_image_id: storePID,
      category_id: this.mainCatData.pk_categoryID,
      update_category_image: true
    }
    this.isCategoryUpdateLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._storeManagerService.snackBar(res["message"]);
      this.isCategoryUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isCategoryUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Recommendations
  getSelectedRecommendations() {
    this.isRecommendationsLoader = true;
    let params = {
      category_recommendations: true,
      category_id: this.mainCatData.pk_categoryID
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedRecommendedProducts = res["data"];
      this.getRecommendationProducts(1);
    }, err => {
      this.isRecommendationsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getRecommendationProducts(page) {
    let params = {
      category_recommendations_current_products: true,
      category_id: this.mainCatData.pk_categoryID,
      keyword: this.recommededKeyword,
      page: page
    }
    if (!this.recommendedProducts || page == 1) {
      this.recommendedProducts = [];
    }
    this._storeManagerService.getStoresData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.recommendedProducts = this.recommendedProducts.concat(res["data"]);
      this.recommendedProductTotal = res["totalRecords"];
      this.recommendedKeywordLoader = false;
      this.isRecommendationsLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.recommendedKeywordLoader = false;
      this.isRecommendationsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNewRecommendeProd() {
    this.recommendedKeywordLoader = true;
    this.recommendedProductsPage++;
    this.getRecommendationProducts(this.recommendedProductsPage)
  }
  onCategoryChange(ev, type, i) {
    if (type == 1) {
      if (ev.checked) {
        this.selectedRecommendedProducts.forEach((element, index) => {
          if (index != i) {
            element.mostPopular = false;
          }
        });
      }
    } else if (type == 2) {
      if (ev.checked) {
        this.selectedRecommendedProducts.forEach((element, index) => {
          if (index != i) {
            element.featured = false;
          }
        });
      }
    } else if (type == 3) {
      if (ev.checked) {
        this.selectedRecommendedProducts.forEach((element, index) => {
          if (index != i) {
            element.primaryRecomm = false;
          }
        });
      }
    }
  }
  addRecommendedPros() {
    this.isAddRecommendeProdsLoader = true;
    let prods = [];
    this.recommendedProducts.forEach(element => {
      if (element.selected) {
        prods.push({ store_productID: element.pk_storeProductID });
      }
    });
    if (prods.length == 0) {
      this._storeManagerService.snackBar('Please select atleast 1 product');
    }
    let payload: addToRecommended = {
      categoryID: this.mainCatData.pk_categoryID,
      list: prods,
      add_category_recommended_products: true
    }
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
      }
      this.getSelectedRecommendations();
      this.isAddRecommendeProdsLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddRecommendeProdsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateRecommendedPros() {
    this.isUpdateRecommendeProdsLoader = true;
    let DeleteRecommendation = [];
    let UpdateRecommendation = [];
    this.selectedRecommendedProducts.forEach(element => {
      if (element.remove) {
        DeleteRecommendation.push({
          store_product_id: element.pk_storeProductID
        });
      } else {
        UpdateRecommendation.push({
          store_product_id: element.pk_storeProductID,
          featured: element.featured,
          mostPopular: element.mostPopular,
          primaryRecomm: element.primaryRecomm,
          recomm: element.recomm
        })
      }
    });
    let payload: updateRecommededProducts = {
      deleteRecommendationProducts: DeleteRecommendation,
      updateRecommendationProducts: UpdateRecommendation,
      category_id: this.mainCatData.pk_categoryID,
      update_category_recommendations: true
    }
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.getSelectedRecommendations();
      }
      this.isUpdateRecommendeProdsLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateRecommendeProdsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
