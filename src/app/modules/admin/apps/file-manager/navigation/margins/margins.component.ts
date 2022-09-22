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

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
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

  constructor(
    private _storesManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initialize();
    this._storesManagerService.storeDetail$.subscribe(result => {
      let data = result["data"][0];
      this.defaultMarginForm.patchValue({
        margin1: Number((data.margin1 * 100).toFixed(2)),
        margin2: Number((data.margin2 * 100).toFixed(2)),
        margin3: Number((data.margin3 * 100).toFixed(2)),
        margin4: Number((data.margin4 * 100).toFixed(2)),
        margin5: Number((data.margin5 * 100).toFixed(2)),
        margin6: Number((data.margin6 * 100).toFixed(2)),
      });
    })
    this.dataSourceLoading = true;
    this.getFirstCall();
    this.isLoadingChange.emit(false);
  };
  initialize() {
    this.defaultMarginForm = new FormGroup({
      margin1: new FormControl(''),
      margin2: new FormControl(''),
      margin3: new FormControl(''),
      margin4: new FormControl(''),
      margin5: new FormControl(''),
      margin6: new FormControl(''),
      store_id: new FormControl(this.selectedStore.pk_storeID),
      update_default_margin: new FormControl(true)
    })
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
    const { margin1, margin2, margin3, margin4, margin5, margin6, store_id, update_default_margin } = this.defaultMarginForm.getRawValue();
    let payload = {
      margin1: (margin1 / 100).toFixed(2),
      margin2: (margin2 / 100).toFixed(2),
      margin3: (margin3 / 100).toFixed(2),
      margin4: (margin4 / 100).toFixed(2),
      margin5: (margin5 / 100).toFixed(2),
      margin6: (margin6 / 100).toFixed(2),
      store_id, update_default_margin
    };
    // Get the supplier products
    this._storesManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this._storesManagerService.getStoreByStoreId(pk_storeID).subscribe(res => {
          this.defaultMarginLoader = false;
          this.defaultMarginMsgLoader = true;
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
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
