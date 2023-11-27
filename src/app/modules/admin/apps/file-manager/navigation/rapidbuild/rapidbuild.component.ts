import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, forkJoin } from 'rxjs';
import { elementAt, takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../store-manager.service';
import { environment } from 'environments/environment';
import { RemoveRapidbuild, UpdateRapidbuildStatus } from '../../stores.types';
import { StoreProductService } from '../../../ecommerce/product-store/store.service';
import { RapidBuildService } from 'app/modules/admin/rapidBuild/components/rapid-build.service';
@Component({
  selector: 'app-rapidbuild',
  templateUrl: './rapidbuild.component.html'
})
export class RapidbuildComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['id', 'status', 'age', 'pid', 'spid', 'product', 'supplier', 'last_proof_of'];
  dataSource = [];
  dataSourceTotalRecord;
  dataSourceLoading = true;
  statusID: number = 2;
  duplicatedDataSource = [];
  tempTotalRecords = [];
  dropdown = [];
  dropdownLoader = true;
  selectedStatus = null;
  dropdownFetchLoader = false;

  filterLoader = false;

  isDetailOpen: boolean = false;
  editItemData: any;
  buildDetailData: any;
  buildDetailColors: any;
  mainScreen = 'Product Details';
  screens = [
    "Product Details",
    "Proof Comments",
    "Current Proof"
  ];


  isRebuildDetailLoader: boolean = false;
  currentProof: boolean = false;

  imgUrl = environment.rapidBuildMedia;
  imprintsDisplayedColumns: string[] = ['number', 'methodName', 'area'];
  imprintsDataSource = [];
  imprintsDataSourceLoading = true;

  ngStatus: any = 2;
  ngPID: any;
  ngProduct: any = '';
  searchPayload: any;
  imageStatusID: any;
  buildComments: any;

  imprintData: any;
  constructor(
    private _storeManagerService: FileManagerService,
    private _storeService: StoreProductService,
    private _rapidBuildService: RapidBuildService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        const { pk_storeID } = this.selectedStore;

        // Get the offline products
        this._storeManagerService.getRapidBuildDropDown(pk_storeID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((response: any) => {
            this.dropdown = response["data"];
            this.selectedStatus = this.dropdown[1];
            this.dropdownLoader = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
        this.searchPayload = {
          dashboard: true,
          store_id: pk_storeID,
          search_image_status_id: 2,
          page: 1,
          size: 20,
        }
        this.getRapidBuildImagesData();
      });
  }
  getRapidBuildImagesData() {
    let payload = this.searchPayload;
    this._storeManagerService.getRapidBuildData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.dataSourceTotalRecord = res["totalRecords"];
      if (this.searchPayload.page == 1 && this.ngStatus == 'all') {
        this.duplicatedDataSource = this.dataSource;
        this.tempTotalRecords = res["totalRecords"];
      }
      this.dataSourceLoading = false;
      this.dropdownFetchLoader = false;
      this.filterLoader = false;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.dataSourceLoading = false;
      this.filterLoader = false;
      this.dropdownFetchLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.searchPayload.page++;
    } else {
      this.searchPayload.page++;
    };
    this.getRapidBuildImagesData();
  };
  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };

  changeStatus(obj): void {
    this.filterLoader = true;
    const { pk_storeID } = this.selectedStore;
    if (obj === 'all') {
      this.searchPayload = {
        dashboard: true,
        store_id: pk_storeID,
        search_image_status_id: -1,
        page: 1,
        size: 20,
      }
    } else {
      this.searchPayload = {
        dashboard: true,
        store_id: pk_storeID,
        page: 1,
        size: 20,
        search_image_status_id: obj.pk_statusID,
      }
    }
    this.getRapidBuildImagesData();
  }

  getRapidBuildImages(): void {
    const { pk_storeID } = this.selectedStore;

    this._storeManagerService.getRapidBuildImages(pk_storeID, this.ngStatus)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceLoading = false;
        this.dropdownFetchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;
    this.dataSourceTotalRecord = this.tempTotalRecords;
    this.ngPID = '';
    this.ngProduct = '';
    this.ngStatus = 'all';
    // Mark for check
    this._changeDetectorRef.markForCheck();
  };

  getAllRapidBuildImages(): void {
    const { pk_storeID } = this.selectedStore;

    this._storeManagerService.getAllRapidBuildImages(pk_storeID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.dropdownFetchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  searchId(event): void {
    const { pk_storeID } = this.selectedStore;
    let keyword = event.target.value;
    if (!keyword) {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };
    this.searchPayload = {
      dashboard: true,
      store_id: 0,
      page: 1,
      id: keyword,
      size: 20,
    }
    this.filterLoader = true;
    this.getRapidBuildImagesData();
  }

  searchKeyword(event): void {
    const { pk_storeID } = this.selectedStore;
    let keyword = event.target.value;
    if (!keyword) {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };
    this.searchPayload = {
      dashboard: true,
      store_id: 0,
      keyword: keyword,
      page: 1,
      size: 20,
    }
    this.filterLoader = true;
    this.getRapidBuildImagesData();
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  editToggle(item) {
    this.currentProof = false;
    this.isDetailOpen = true;

    if (item.categorySubCategory) {
      const [subCatID, subCatName, subCatLink, catID, catName, catLink] = item.categorySubCategory.split('::');
      item.catData = { subCatID, subCatName, subCatLink, catID, catName, catLink };
      item.storeProdURL = `${this.selectedStore.protocol}${item.storeURL}/${catLink}/${subCatLink}/${item.permalink}/${item.fk_storeProductID}`
    }
    this.editItemData = item;
    let random = Math.random();
    this.getRebuildDetails()
    this.checkIfImageExists(`https://assets.consolidus.com/globalAssets/rapidBuild/${this.editItemData.pk_rapidBuildID}.jpg?${random}`);
  }
  getRebuildDetails() {
    this.isRebuildDetailLoader = true;
    let params = {
      rapidbuild_details: true,
      rbid: this.editItemData.pk_rapidBuildID,
      spid: this.editItemData.fk_storeProductID,
      productID: this.editItemData.pk_productID
    }
    this._storeManagerService.getRapidData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.buildDetailData = res["data"];
      this.imageStatusID = this.editItemData.pk_statusID
      let arr = [];
      res["colors"].forEach(element => {
        arr.push(element.colorName);
      });
      this.buildDetailColors = arr.toString();
      this.imprintsDataSource = res["imprints"];
      this.isRebuildDetailLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRebuildDetailLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  backToList() {
    this.isDetailOpen = false;
    this.editItemData = null;
  }
  checkIfImageExists(url) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        this.currentProof = true;
        this.imgUrl = url;
        this._changeDetectorRef.markForCheck();
      };

      img.onerror = () => {
        this.currentProof = false;
        return;
      };
    }
  };
  getImprints() {
    // if (this.imprintsDataSource.length == 0) {
    //   this.imprintsDataSourceLoading = true;
    //   let params = {
    //     imprint: true,
    //     product_id: this.editItemData.pk_productID,
    //   }
    //   this._storeManagerService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //     this.imprintsDataSource = res["data"];
    //     this.imprintsDataSourceLoading = false;
    //     this._changeDetectorRef.markForCheck();
    //   }, err => {
    //     this.imprintsDataSourceLoading = false;
    //     this._changeDetectorRef.markForCheck();
    //   })
    // }
  }


  uploadMainImages() {
    if (this.imageStatusID == 4) {
      this.buildDetailData.submitLoader = true;
      let payload = {
        path: this.imgUrl,
        convert_store_image_64: true
      }
      this._storeService.postStoresProductsData(payload).subscribe(res => {
        const paths: string[] = [`/globalAssets/Products/Images/${this.editItemData.pk_storeProductID}.jpg`, `/globalAssets/Products/HiRes/${this.editItemData.pk_storeProductID}.jpg`, `/globalAssets/Products/Thumbnails/${this.editItemData.fk_storeProductID}.jpg`];
        const uploadObservables: Observable<any>[] = paths.map(path => {
          return this.uploadMediMainBase64(path, res["base64"]);
        });
        forkJoin(uploadObservables).subscribe(
          () => {
            this.submitRapidBuild();
          })
      });
    } else {
      this.submitRapidBuild();
    }
  }
  uploadMediMainBase64(path, base64) {
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: path
    };
    return this._storeService.addMedia(payload);
  }

  submitRapidBuild() {
    this.buildDetailData.submitLoader = true;
    let imprints = [];
    this.imprintsDataSource.forEach(element => {
      imprints.push(element.imprints);
    });
    let paylaod: UpdateRapidbuildStatus = {
      rbid: this.editItemData.pk_rapidBuildID,
      imageStatusID: this.imageStatusID,
      comments: this.buildComments.replace(/'/g, "''"),
      rbid_userID: this.editItemData.pk_userID,
      rbid_firstName: this.editItemData.rapidBuildUserFirstName,
      rbid_lastName: this.editItemData.rapidBuildUserLastName,
      storeProductID: this.editItemData.fk_storeProductID,
      available_colors: this.buildDetailColors,
      imprint_list: imprints.toString(),
      productID: this.editItemData.pk_productID,
      productNumber: this.editItemData.productNumber,
      productDesc: this.editItemData.productDesc,
      companyName: this.editItemData.companyName,
      supplierLink: this.editItemData.supplierLink,
      blnStoreActive: this.editItemData.blnStoreActive,
      update_rapidbuild_status: true
    }
    this._storeManagerService.putStoresRapidData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["message"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.searchPayload = {
          dashboard: true,
          store_id: this.selectedStore.pk_storeID,
          search_image_status_id: 2,
          page: 1,
          size: 20,
        }
        this.buildComments = '';
        this.dataSourceLoading = true;
        this.ngStatus = 2;
        this.ngPID = '';
        this.ngProduct = '';
        this.getRapidBuildImagesData();
        this.backToList();
      }
      this.buildDetailData.submitLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.buildDetailData.submitLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removeRapidBuild() {
    this.buildDetailData.deleteLoader = true;
    let imprints = [];
    this.imprintsDataSource.forEach(element => {
      imprints.push(element.imprints);
    });
    let paylaod: RemoveRapidbuild = {
      rbid: this.editItemData.pk_rapidBuildID,
      rbid_userID: this.editItemData.pk_userID,
      remove_rapidbuild: true
    }
    this._storeManagerService.putStoresRapidData(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["message"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.dataSource = this.dataSource.filter(element => element.pk_rapidBuildID != this.editItemData.pk_rapidBuildID)
        this.dataSourceTotalRecord--;
        this.backToList();
      }
      this.buildDetailData.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.buildDetailData.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  convertHoursToDays(hours) {
    if (hours >= 24) {
      // Convert hours to days
      const days = Math.floor(hours / 24);
      return `${days} days`;
    } else {
      // Show in hours if less than 1 day
      return `${hours} hours`;
    }
  }
}

