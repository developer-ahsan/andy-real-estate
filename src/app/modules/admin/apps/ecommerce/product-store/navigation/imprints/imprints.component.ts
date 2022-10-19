import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from '../../../inventory/inventory.service';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-store-imprints',
  templateUrl: './imprints.component.html',
  styles: ['fuse-alert .fuse-alert-container .mat-icon {color: gray !important} fuse-alert.fuse-alert-appearance-soft.fuse-alert-type-info .fuse-alert-container .fuse-alert-message {color: gray !important}'],
  encapsulation: ViewEncapsulation.None,
})
export class StoreImprintsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imprintsColumns: string[] = ['id', 'location', 'method', 'setup', 'run', 'decorator', 'action'];
  imprintsData = [];

  isUpdateLoading: boolean = false;
  isEditImprint: boolean = false;
  storeData: any;

  suppliers = [];

  editImprintData: any;
  editImprintLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _productService: InventoryService
  ) { }

  ngOnInit(): void {
    this._productService.Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.suppliers = res["data"];
    })
    this._storeService.store$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.storeData = res["data"][0];
    });
    // Create the selected product form
    this.isLoading = true;
    this.getImprints();
  }

  getImprints() {
    let params = {
      store_product_imprints: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintsData = res["data"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
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
    this.isEditImprint = true;
  }
  cancelEditImprint() {
    this.isEditImprint = false;
  }
  UpdateImprint() {
    this.editImprintLoader = true;
    const { fk_decoratorID, fk_setupChargeID, fk_runChargeID, fk_collectionID } = this.editImprintData;
    let payload = {
      fk_decoratorID: fk_decoratorID,
      fk_setupChargeID: fk_setupChargeID,
      fk_runChargeID: fk_runChargeID,
      fk_collectionID: fk_collectionID,
      update_imprint: true,
      storeProductID: Number(this.selectedProduct.pk_storeProductID)
    }
    this._storeService.UpdateImprint(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.editImprintLoader = false;
      this._storeService.snackBar('Store product imprint updated successfully');
      this.isEditImprint = false;
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
