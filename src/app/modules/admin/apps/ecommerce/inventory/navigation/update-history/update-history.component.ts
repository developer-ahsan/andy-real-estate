import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import moment from 'moment';

@Component({
  selector: 'app-update-history',
  templateUrl: './update-history.component.html'
})
export class UpdateHistoryComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  htmlHistory: string = '';

  displayedColumns: string[] = ['dateModified', 'history'];
  dataSource = [];
  page = 1;

  legacyHistoryLoader = true;
  showLegacyLoader = false;

  buttonText = "Legacy System History";

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;

    this.getHistoryByProductId(1);

    this._inventoryService.getUpdateHistoryByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((history) => {
        this.htmlHistory = history["data"][0]?.updateHistory;

        this.legacyHistoryLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  getNextData(event) {
    this.isLoading = true;
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getHistoryByProductId(this.page);
  }

  getHistoryByProductId(page) {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getHistoryProductId(pk_productID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((history) => {
        this.dataSource = history["data"];

        if (this.dataSource.length) {
          for (const obj of this.dataSource) {
            const { dateAdded } = obj;
            obj["dateModified"] = dateAdded ? moment.utc(dateAdded).format("lll") : "N/A";
          }
        };

        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  viewLegacySystemHistoryViceVerse() {
    this.showLegacyLoader = !this.showLegacyLoader;
    if (this.buttonText === "View History") {
      this.buttonText = "Legacy System History";
    } else {
      this.buttonText = "View History";
    }
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}