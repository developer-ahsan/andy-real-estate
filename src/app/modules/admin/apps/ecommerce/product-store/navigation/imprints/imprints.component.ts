import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from '../../../inventory/inventory.service';
import { StoreProductService } from '../../store.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-store-imprints',
  templateUrl: './imprints.component.html',
  styles: ['fuse-alert .fuse-alert-container .mat-icon {color: gray !important} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-message {color: gray !important}'],
  encapsulation: ViewEncapsulation.None,
})
export class StoreImprintsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imprintsColumns: string[] = ['id', 'location', 'method', 'setup', 'run', 'decorator', 'action'];
  imprintsData = [];
  totalImprints = 0;
  page = 1;

  isUpdateLoading: boolean = false;
  isEditImprint: boolean = false;

  suppliers = [];

  editImprintData: any;
  editImprintLoader: boolean = false;
  EditImprintData: any = {
    fk_decoratorID: Number,
    fk_collectionID: Number,
    fk_setupChargeID: Number,
    fk_runChargeID: Number
  }
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _commonService: DashboardsService,
    private _productService: InventoryService
  ) { }

  ngOnInit(): void {
    this._commonService.suppliersData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.suppliers = res["data"];
    })
    // Create the selected product form
    this.isLoading = true;
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getImprints();
    });
  }
  getImprints() {
    let params = {
      page: this.page,
      store_product_imprints: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintsData = res["data"];
      this.totalImprints = res["totalRecords"];
      this.isEditImprint = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextColors(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getImprints();
  };
  checkSupplier(id) {
    let index: any = this.suppliers.findIndex(element => element.pk_companyID == id);
    return this.suppliers[index].companyName;
  }
  UpdateImprintStatus() {
    this.isUpdateLoading = true;
    let imprints: number[] = [];
    this.imprintsData.forEach(element => {
      if (element.blnStoreProductImprintActive) {
        imprints.push(element.pk_imprintID);
      }
    });
    let payload = {
      imprint_ids: imprints,
      storeProductID: Number(this.selectedProduct.pk_storeProductID),
      update_imprint_status: true
    }
    this._storeService.UpdateImprintStatus(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar('Store product imprints updated successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  editImprint(item) {
    this.editImprintData = item;
    this.EditImprintData.fk_decoratorID = item.storeProductDecoratorID ? item.storeProductDecoratorID : item.fk_decoratorID;
    this.EditImprintData.fk_setupChargeID = item.storeProductSetupChargeID ? item.storeProductSetupChargeID : item.fk_setupChargeID;
    this.EditImprintData.fk_runChargeID = item.storeProductRunChargeID ? item.storeProductRunChargeID : item.fk_runChargeID;
    this.EditImprintData.fk_collectionID = item.storeProductCollectionID ? item.storeProductCollectionID : item.fk_collectionID;
    this.isEditImprint = true;
  }
  cancelEditImprint() {
    this.isEditImprint = false;
  }
  UpdateImprint() {
    this.editImprintLoader = true;
    const { fk_decoratorID, fk_setupChargeID, fk_runChargeID, fk_collectionID } = this.EditImprintData;
    let decorator = fk_decoratorID;
    if (fk_decoratorID == this.editImprintData.fk_decoratorID || fk_decoratorID == this.editImprintData.storeProductDecoratorID) {
      decorator = null;
    }
    let setup = fk_setupChargeID;
    if (fk_setupChargeID == this.editImprintData.fk_setupChargeID || fk_setupChargeID == this.editImprintData.storeProductSetupChargeID) {
      setup = null;
    }
    let run = fk_runChargeID;
    if (fk_runChargeID == this.editImprintData.fk_runChargeID || fk_runChargeID == this.editImprintData.storeProductRunChargeID) {
      run = null;
    }
    let collection = fk_collectionID;
    if (fk_collectionID == this.editImprintData.fk_collectionID || fk_collectionID == this.editImprintData.storeProductCollectionID) {
      collection = null;
    }
    let payload = {
      fk_decoratorID: decorator,
      fk_setupChargeID: setup,
      fk_runChargeID: run,
      fk_collectionID: collection,
      update_imprint: true,
      storeProductID: Number(this.selectedProduct.pk_storeProductID)
    }
    this._storeService.UpdateImprint(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getImprints();
      this.editImprintLoader = false;
      this._storeService.snackBar('Store product imprint updated successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.editImprintLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
