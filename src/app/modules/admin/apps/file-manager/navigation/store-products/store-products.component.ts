import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { takeUntil } from 'rxjs/operators';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html'
})

export class StoreProductsComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'name', 'vendor', 'master', 'store', 'desc', 'video', 'techno_logo'];
  dataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.dataSourceLoading = true;
    this.getMainStoreCall(this.page);
    this.isLoadingChange.emit(false);
  }

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._fileManagerService.getStoreProducts(pk_storeID, page)
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

}
