import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { ApplyBlanketFOBlocation, updateCompanySettings } from '../../vendors.types';
declare var $: any;

@Component({
  selector: 'app-vendor-blanket-location',
  templateUrl: './vendor-blanket-location.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorBlanketComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchLocationCtrl = new FormControl();
  selectedLocation: any;
  isSearchingLocation = false;

  allLocations = [];
  @ViewChild('apply') apply: ElementRef;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getVendorsData();
    let params;
    this.searchLocationCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          fob_locations: true,
          keyword: res,
          company_id: this.supplierData.pk_companyID
        }
        return res != null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allLocations = [];
        this.isSearchingLocation = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingLocation = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allLocations = data['data'];
    });
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getFOBLocations();
      this._changeDetectorRef.markForCheck();
    });
  }
  getFOBLocations() {
    let params = {
      fob_locations: true,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allLocations = res["data"];
      this.selectedLocation = this.allLocations[0];
      this.searchLocationCtrl.setValue({ FOBLocationName: this.selectedLocation?.FOBLocationName }, { emitEvent: false });
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  onSelected(ev) {
    this.selectedLocation = ev.option.value;
  }

  displayWith(value: any) {
    return value?.FOBLocationName;
  }
  onBlur() {
    this.searchLocationCtrl.setValue({ FOBLocationName: this.selectedLocation?.FOBLocationName }, { emitEvent: false });
  }
  updateLocations() {
    if (!this.selectedLocation) {
      this._vendorService.snackBar('Please choose any F.O.B Location');
      $(this.apply.nativeElement).modal('hide');
      return;
    }
    let payload: ApplyBlanketFOBlocation = {
      supplier_id: this.supplierData.pk_companyID,
      location_id: this.selectedLocation.pk_FOBLocationID,
      supplier_name: this.supplierData.companyName,
      apply_fob_location: true
    }
    this.isUpdateLoader = true;
    this._vendorService.putVendorsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._vendorService.snackBar(res["message"]);
      this.isUpdateLoader = false;
      $(this.apply.nativeElement).modal('hide');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._vendorService.snackBar('Something went wrong');
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  openApplyModal() {
    $(this.apply.nativeElement).modal('show');
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
