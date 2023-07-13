import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../store-manager.service';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-rapidbuild',
  templateUrl: './rapidbuild.component.html'
})
export class RapidbuildComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['id', 'status', 'product', 'supplier', 'last_proof_of'];
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
  imprintsDisplayedColumns: string[] = ['number', 'methodName', 'locationName', 'area'];
  imprintsDataSource = [];
  imprintsDataSourceLoading = true;

  ngStatus = 'all';
  ngPID: any;
  ngProduct: any = '';
  searchPayload: any;
  constructor(
    private _storeManagerService: FileManagerService,
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
          page: 1,
          size: 20,
        }
        this.getRapidBuildImagesData();
      });
  }
  getRapidBuildImagesData() {
    let payload = this.searchPayload;
    this._storeManagerService.getRapidBuildData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      console.log(res)
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
      store_id: pk_storeID,
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
      store_id: pk_storeID,
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
    this.editItemData = item;
    this.getRebuildDetails()
    this.getImageOrFallback('https://assets.consolidus.com/globalAssets/rapidBuild/rbid.jpg').then(res => {
      this.currentProof = true;
    }, err => {
    });
  }
  getRebuildDetails() {
    this.isRebuildDetailLoader = true;
    let params = {
      rapidbuild_details: true,
      rbid: this.editItemData.pk_rapidBuildID,
      spid: this.editItemData.fk_storeProductID
    }
    this._storeManagerService.getRapidData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.buildDetailData = res["data"];
      let arr = [];
      res["colors"].forEach(element => {
        arr.push(element.colorName);
      });
      this.buildDetailColors = arr.toString();
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
  getImageOrFallback(path) {
    return new Promise(resolve => {
      const img = new Image();
      img.src = path;
      img.onload = () => resolve(path);
    });
  };
  getImprints() {
    if (this.imprintsDataSource.length == 0) {
      this.imprintsDataSourceLoading = true;
      let params = {
        imprint: true,
        product_id: this.editItemData.pk_productID,
      }
      this._storeManagerService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.imprintsDataSource = res["data"];
        this.imprintsDataSourceLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.imprintsDataSourceLoading = false;
        this._changeDetectorRef.markForCheck();
      })
    }
  }
}
