import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { ApplyBlanketCollection, ApplyBlanketFOBlocation, updateCompanySettings } from '../../vendors.types';
declare var $: any;

@Component({
  selector: 'app-vendor-blanket-imprint-colors',
  templateUrl: './vendor-blanket-imprint-colors.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorBlanketColorsComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  blnSettings: boolean = true;
  isUpdateLoader: boolean = false;
  supplierData: any;

  searchColorCtrl = new FormControl();
  seletedCollection: any;
  isSearchingColor = false;

  allCollections = [];
  @ViewChild('updateColors') updateColors: ElementRef;
  updateModalData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getVendorsData();
    let params;
    this.searchColorCtrl.valueChanges.pipe(
      filter((res: any) => {
        params = {
          blanket_collections: true,
          keyword: res,
          company_id: this.supplierData.pk_companyID
        }
        return res != null && res.length >= 3
      }),
      distinctUntilChanged(),
      debounceTime(300),
      tap(() => {
        this.allCollections = [];
        this.isSearchingColor = true;
        this._changeDetectorRef.markForCheck();
      }),
      switchMap(value => this._vendorService.getVendorsData(params)
        .pipe(
          finalize(() => {
            this.isSearchingColor = false
            this._changeDetectorRef.markForCheck();
          }),
        )
      )
    ).subscribe((data: any) => {
      this.allCollections = data['data'];
    });
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getColorCollections();
      this._changeDetectorRef.markForCheck();
    });
  }
  getColorCollections() {
    let params = {
      blanket_collections: true,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allCollections = res["data"];
      if (this.allCollections.length) {
        this.seletedCollection = this.allCollections[0];
        this.searchColorCtrl.setValue({ collectionName: this.seletedCollection?.collectionName }, { emitEvent: false });
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  onSelected(ev) {
    this.seletedCollection = ev.option.value;
  }

  displayWith(value: any) {
    return value?.collectionName;
  }
  onBlur() {
    this.searchColorCtrl.setValue({ collectionName: this.seletedCollection.collectionName }, { emitEvent: false });
  }
  updateCollectionModal() {
    $(this.updateColors.nativeElement).modal('show');
  }
  updateCollection() {
    if (!this.seletedCollection) {
      this._vendorService.snackBar('Please select a color collection from the list.');
      return;
    }
    let payload: ApplyBlanketCollection = {
      supplier_id: this.supplierData.pk_companyID,
      collection_id: this.seletedCollection.pk_collectionID,
      apply_blanket_collection: true
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
