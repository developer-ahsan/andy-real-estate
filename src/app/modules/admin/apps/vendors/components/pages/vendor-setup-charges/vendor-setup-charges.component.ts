import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { ApplyBlanketFOBlocation, ApplyBlanketSetup, updateCompanySettings } from '../../vendors.types';

@Component({
  selector: 'app-vendor-setup-charges',
  templateUrl: './vendor-setup-charges.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorSetupChargesComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isUpdateLoader: boolean = false;
  supplierData: any;


  runCharge = '';
  setupProcesses: any;
  setupQuantity: any[] = [];
  runChargeID: string;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.getVendorsData();
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this._changeDetectorRef.markForCheck();
    });
  }
  getCharges() {
    this.isLoading = true;
    let params = {
      imprint: true,
      decoration: true,
      charge_distribution: true,
      charge_id: Number(this.runCharge)
    };
    let run = [];
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        if (run.length == 0) {
          run.push({ process: element.processQuantity, data: [element] });
        } else {
          const index = run.findIndex(item => item.process == element.processQuantity);
          if (index > -1) {
            run[index].data.push(element);
          } else {
            run.push({ process: element.processQuantity, data: [element] });
          }
        }
      });
      this.setupProcesses = run;
      if (run.length) {
        this.setupQuantity = run[0].data;
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateSetupBlanket() {
    if (this.runChargeID == '') {
      this._vendorService.snackBar('Please provide charge id');
      return;
    }
    let payload: ApplyBlanketSetup = {
      supplier_id: this.supplierData.pk_companyID,
      charge_id: Number(this.runChargeID),
      apply_blanket_setup: true
    }
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._vendorService.snackBar(res["message"]);
      this.runChargeID = '';
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
