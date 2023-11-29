import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { updateCompanySettings, updateVendorStatus } from '../../vendors.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-vendor-status',
  templateUrl: './vendor-status.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorStatusComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnActive: boolean = false;
  isUpdateLoader: boolean = false;
  supplierData: any;
  disabledReason: '';
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getVendorsData();
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.blnActive = this.supplierData.blnActiveVendor;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateSettings() {
    this.supplierData.blnActiveVendor = this.blnActive;
    let payload: updateVendorStatus = {
      companyID: this.supplierData.pk_companyID,
      blnActiveVendor: this.blnActive,
      disabledReason: this.disabledReason,
      update_vendor_status: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.supplierData.blnActiveVendor = this.blnActive;
      this.disabledReason = '';
      if (res) {
        this._vendorService.snackBar(res["message"]);
      }
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
