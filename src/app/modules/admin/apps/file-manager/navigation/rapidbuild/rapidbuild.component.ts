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

        this.getRapidBuildImages(2);
      });
  }

  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };

  changeStatus(obj): void {
    this.filterLoader = true;
    const { pk_storeID } = this.selectedStore;

    if (obj === 'all') {
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
      return;
    };
    console.log(obj)
    const { pk_statusID } = obj;
    this.statusID = pk_statusID;

    this._storeManagerService.getRapidBuildImages(pk_storeID, pk_statusID)
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

  getRapidBuildImages(statusId): void {
    const { pk_storeID } = this.selectedStore;

    this._storeManagerService.getRapidBuildImages(pk_storeID, statusId)
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
    this.filterLoader = true;
    let keyword = event.target.value;

    if (!keyword) {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    this._storeManagerService.getAllRapidBuildImagesById(pk_storeID, keyword)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.filterLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  searchKeyword(event): void {
    const { pk_storeID } = this.selectedStore;
    this.filterLoader = true;
    let keyword = event.target.value;

    if (!keyword) {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    this._storeManagerService.getAllRapidBuildImagesByKeyword(pk_storeID, keyword)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;
        this.filterLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
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
