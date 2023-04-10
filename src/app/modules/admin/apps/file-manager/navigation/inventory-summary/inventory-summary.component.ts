import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../../ecommerce/inventory/inventory.service';

@Component({
  selector: 'app-inventory-summary',
  templateUrl: './inventory-summary.component.html'
})
export class InventorySummaryComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'id', 'product', 'vendor', 'inventory', 'threshold', 'fee'];
  dataSource = [];
  dataSourceLoading = false;
  dataSourceTotalRecord: any;
  page: number = 1;

  keywordSearch: string = "";
  isKeywordSearch: boolean = false;

  isEditInventory: boolean = false;
  isEditInventoryForm: FormGroup;
  constructor(
    private _storeManagerService: FileManagerService,
    private _inventoryService: InventoryService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.isEditInventoryForm = new FormGroup({
          isWarehouse: new FormControl(true),
          inventory: new FormControl(''),
          inventoryThreshold: new FormControl(''),
          warehousingCost: new FormControl(''),
          maxQuantity: new FormControl(''),
          deliveryNote: new FormControl(''),
          pk_storeProductID: new FormControl(''),
          productName: new FormControl(''),
          pk_productID: new FormControl(''),
          companyName: new FormControl(''),
          vendorRelation: new FormControl(''),
        })
        this.dataSourceLoading = true;
        this.getSummary(1);
      });
  }
  getSummary(page) {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      inventory_summary: true,
      size: 20,
      page: page
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.dataSourceLoading = false;
        this.dataSourceTotalRecord = res["totalRecords"];
        this.dataSource = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSummary(this.page);
  };
  routeInventory(id) {
    this._inventoryService.selectedIndex = 'Warehouse Options';
    this.router.navigate(['apps/ecommerce/inventory', id]);
    setTimeout(() => {
      this._inventoryService.selectedIndex = null;
    }, 2000);
  }
  backToInventory() {
    this.isEditInventory = false;
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
