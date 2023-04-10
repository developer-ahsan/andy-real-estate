import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-rapidbuild-actions',
  templateUrl: './rapidbuild-actions.component.html'
})

export class RapidbuildActionsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'name', 'master', 'store'];
  dataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.dataSourceLoading = true;
        this.getMainStoreCall(this.page);
      });
  }

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._storeManagerService.getStoreProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSourceTotalRecord = response["totalRecords"];
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
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
