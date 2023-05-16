import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-margins',
  templateUrl: './margins.component.html',
})
export class MarginsComponent implements OnInit, OnDestroy {

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['frequency', '1', '2', '3', '4', '5', '6'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  keywordSearch: string = "";
  isKeywordSearch: boolean = false;
  mainScreen: string = "Margins";
  screens = [
    "Margins",
    "Default Values"
  ];

  defaultMarginForm: FormGroup;
  defaultMarginLoader: boolean = false;
  defaultMarginMsgLoader: boolean = false;

  isMarginDetails: boolean = false;
  marginDetailsData: any;
  marginDetailForm: FormGroup;

  constructor(
    private _storesManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storesManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.initialize();
        this.defaultMarginForm.patchValue({
          margin1: Number((this.selectedStore.margin1 * 100).toFixed(2)),
          margin2: Number((this.selectedStore.margin2 * 100).toFixed(2)),
          margin3: Number((this.selectedStore.margin3 * 100).toFixed(2)),
          margin4: Number((this.selectedStore.margin4 * 100).toFixed(2)),
          margin5: Number((this.selectedStore.margin5 * 100).toFixed(2)),
          margin6: Number((this.selectedStore.margin6 * 100).toFixed(2)),
          apparel1: Number((this.selectedStore?.apparelmargin1 * 100).toFixed(2)),
          apparel2: Number((this.selectedStore?.apparelMargin2 * 100).toFixed(2)),
          apparel3: Number((this.selectedStore?.apparelMargin3 * 100).toFixed(2)),
          apparel4: Number((this.selectedStore?.apparelMargin4 * 100).toFixed(2)),
          apparel5: Number((this.selectedStore?.apparelMargin5 * 100).toFixed(2)),
          apparel6: Number((this.selectedStore?.apparelMargin6 * 100).toFixed(2)),
          print1: Number((this.selectedStore?.printMargin1 * 100).toFixed(2)),
          print2: Number((this.selectedStore?.printMargin2 * 100).toFixed(2)),
          print3: Number((this.selectedStore?.printMargin3 * 100).toFixed(2)),
          print4: Number((this.selectedStore?.printMargin4 * 100).toFixed(2)),
          print5: Number((this.selectedStore?.printMargin5 * 100).toFixed(2)),
          print6: Number((this.selectedStore?.printMargin6 * 100).toFixed(2)),
        });
        this.dataSourceLoading = true;
        this.getFirstCall();
      });
  }
  initialize() {
    this.defaultMarginForm = new FormGroup({
      margin1: new FormControl(''),
      margin2: new FormControl(''),
      margin3: new FormControl(''),
      margin4: new FormControl(''),
      margin5: new FormControl(''),
      margin6: new FormControl(''),
      apparel1: new FormControl(''),
      apparel2: new FormControl(''),
      apparel3: new FormControl(''),
      apparel4: new FormControl(''),
      apparel5: new FormControl(''),
      apparel6: new FormControl(''),
      print1: new FormControl(''),
      print2: new FormControl(''),
      print3: new FormControl(''),
      print4: new FormControl(''),
      print5: new FormControl(''),
      print6: new FormControl(''),
      store_id: new FormControl(this.selectedStore.pk_storeID),
      update_default_margin: new FormControl(true)
    });
    this.marginDetailForm = new FormGroup({
      margin1: new FormControl(''),
      margin2: new FormControl(''),
      margin3: new FormControl(''),
      margin4: new FormControl(''),
      margin5: new FormControl(''),
      margin6: new FormControl('')
    });
  }
  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };

  getFirstCall() {
    const { pk_storeID } = this.selectedStore;

    let params = {
      margin: true,
      store_id: pk_storeID
    }
    // Get the supplier products
    this._storesManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.duplicatedDataSource = this.dataSource;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.dataSourceLoading = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._storesManagerService.getOfflineProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.dataSource = [];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getMainStoreCall(this.page);
  };

  resetSearch(): void {
    this.dataSource = this.duplicatedDataSource;
    this.keywordSearch = "";

    // Mark for check
    this._changeDetectorRef.markForCheck();
  };

  searchStoreProduct(event): void {
    const { pk_storeID } = this.selectedStore;

    let keyword = event.target.value ? event.target.value : '';
    this.keywordSearch = keyword;

    if (this.keywordSearch) {
      this.isKeywordSearch = true;
      this._storesManagerService.getOfflineProductsByKeyword(pk_storeID, keyword)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          this.dataSource = response["data"];
          this.isKeywordSearch = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.isKeywordSearch = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._snackBar.open("Please enter text to search", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    }
  };

  updateDefaultMargin() {
    this.defaultMarginLoader = true;
    const { pk_storeID } = this.selectedStore;
    const { margin1, margin2, margin3, margin4, margin5, margin6, apparel1, apparel2, apparel3, apparel4, apparel5, apparel6, print1, print2, print3, print4, print5, print6, store_id, update_default_margin } = this.defaultMarginForm.getRawValue();
    let payload = {
      margin1: (margin1 / 100).toFixed(2),
      margin2: (margin2 / 100).toFixed(2),
      margin3: (margin3 / 100).toFixed(2),
      margin4: (margin4 / 100).toFixed(2),
      margin5: (margin5 / 100).toFixed(2),
      margin6: (margin6 / 100).toFixed(2),
      apparelMargin1: (apparel1 / 100).toFixed(2),
      apparelMargin2: (apparel2 / 100).toFixed(2),
      apparelMargin3: (apparel3 / 100).toFixed(2),
      apparelMargin4: (apparel4 / 100).toFixed(2),
      apparelMargin5: (apparel5 / 100).toFixed(2),
      apparelMargin6: (apparel6 / 100).toFixed(2),
      printMargin1: (print1 / 100).toFixed(2),
      printMargin2: (print2 / 100).toFixed(2),
      printMargin3: (print3 / 100).toFixed(2),
      printMargin4: (print4 / 100).toFixed(2),
      printMargin5: (print5 / 100).toFixed(2),
      printMargin6: (print6 / 100).toFixed(2),
      store_id, update_default_margin
    };
    // Get the supplier products
    this._storesManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this._storesManagerService.getStoreByStoreId(pk_storeID).subscribe(res => {
          this.defaultMarginLoader = false;
          this.defaultMarginMsgLoader = true;
          this.selectedStore.margin1 = margin1;
          this.selectedStore.margin2 = margin2;
          this.selectedStore.margin3 = margin3;
          this.selectedStore.margin4 = margin4;
          this.selectedStore.margin5 = margin5;
          this.selectedStore.margin6 = margin6;
          this.selectedStore.printMargin1 = print1;
          this.selectedStore.printMargin12 = print2;
          this.selectedStore.printMargin13 = print3;
          this.selectedStore.printMargin14 = print4;
          this.selectedStore.printMargin15 = print5;
          this.selectedStore.printMargin16 = print6;
          this.selectedStore.apparelmargin1 = apparel1;
          this.selectedStore.apparelMargin2 = apparel2;
          this.selectedStore.apparelMargin3 = apparel3;
          this.selectedStore.apparelMargin4 = apparel4;
          this.selectedStore.apparelMargin5 = apparel5;
          this.selectedStore.apparelMargin6 = apparel6;
          setTimeout(() => {
            this.defaultMarginMsgLoader = false;
            this._changeDetectorRef.markForCheck();
          }, 2000);
          this._changeDetectorRef.markForCheck();
        })


        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
        this.defaultMarginLoader = false;
      });
  };
  marginDetails(item) {
    this.marginDetailsData = item;
    this.marginDetailForm.patchValue({
      margin1: (item.margin1 * 100).toFixed(2),
      margin2: (item.margin2 * 100).toFixed(2),
      margin3: (item.margin3 * 100).toFixed(2),
      margin4: (item.margin4 * 100).toFixed(2),
      margin5: (item.margin5 * 100).toFixed(2),
      margin6: (item.margin6 * 100).toFixed(2)
    });
    console.log(item)
    this.isMarginDetails = true;
    this._changeDetectorRef.markForCheck();
  }
  applyMargins(type) {
    const { margin1, margin2, margin3, margin4, margin5, margin6, apparel1, apparel2, apparel3, apparel4, apparel5, apparel6, print1, print2, print3, print4, print5, print6, store_id, update_default_margin } = this.defaultMarginForm.getRawValue();
    if (type == 'goods') {
      this.marginDetailForm.patchValue({
        margin1: apparel1,
        margin2: apparel2,
        margin3: apparel3,
        margin4: apparel4,
        margin5: apparel5,
        margin6: apparel6
      });
    } else {
      this.marginDetailForm.patchValue({
        margin1: print1,
        margin2: print2,
        margin3: print3,
        margin4: print4,
        margin5: print5,
        margin6: print6
      });
    }
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
