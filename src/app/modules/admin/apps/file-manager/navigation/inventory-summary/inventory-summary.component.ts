import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inventory-summary',
  templateUrl: './inventory-summary.component.html'
})
export class InventorySummaryComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'id', 'product', 'vendor', 'inventory', 'threshold', 'fee'];
  dataSource = [];
  dataSourceLoading = false;
  page: number = 1;

  keywordSearch: string = "";
  isKeywordSearch: boolean = false;

  isEditInventory: boolean = false;
  isEditInventoryForm: FormGroup;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
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
    this.getSummary();
    this.isLoadingChange.emit(false);
  };
  getSummary() {
    let params = {
      store_id: this.selectedStore.pk_storeID,
      inventory_summary: true
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.dataSourceLoading = false;
        this.dataSource = res["data"];
        this._changeDetectorRef.markForCheck();
      })
  }
  editInventory(obj) {
    this.isEditInventoryForm.patchValue(obj);
    this.isEditInventory = true;
  }
  backToInventory() {
    this.isEditInventory = false;
  }

}
