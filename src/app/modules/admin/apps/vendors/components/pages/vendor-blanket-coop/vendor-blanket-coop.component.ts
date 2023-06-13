import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { ApplyBlanketFOBlocation, applyCompanyWideCoop, updateCompanySettings } from '../../vendors.types';

@Component({
  selector: 'app-vendor-blanket-coop',
  templateUrl: './vendor-blanket-coop.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorBlanketCoopComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchCoopCtrl = new FormControl();
  selectedCoop: any;
  isSearchingCoop = false;

  allCoops = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getVendorsData();
    let params;
    this.searchCoopCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          coOps: true,
          keyword: res,
          company_id: this.supplierData.pk_companyID
        }
        return res != null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allCoops = [];
        this.isSearchingCoop = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingCoop = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allCoops = data['data'];
    });
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getCoops();
      this._changeDetectorRef.markForCheck();
    });
  }
  getCoops() {
    let params = {
      coOps: true,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allCoops = res["data"];
      if (this.allCoops.length > 0) {
        this.selectedCoop = this.allCoops[0];
        this.searchCoopCtrl.setValue({ name: this.selectedCoop.name }, { emitEvent: false });
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  onSelected(ev) {
    this.selectedCoop = ev.option.value;
  }

  displayWith(value: any) {
    return value?.name;
  }
  onBlur() {
    this.searchCoopCtrl.setValue({ name: this.selectedCoop.name }, { emitEvent: false });
  }
  updateCoops() {
    if (!this.selectedCoop) {
      this._vendorService.snackBar('No Coop Selected');
      return;
    }
    let payload: applyCompanyWideCoop = {
      companyID: this.supplierData.pk_companyID,
      coopID: this.selectedCoop.pk_coopID,
      companyName: this.supplierData.companyName,
      apply_blanket_Coop: true
    }
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._vendorService.snackBar(res["message"]);
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
