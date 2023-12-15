import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../../vendors.service';
import { AddColor, AddImprintColor, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor } from '../../../vendors.types';

@Component({
  selector: 'app-product-color-imprint',
  templateUrl: './product-imprint.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorImprintProductComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  imprintProducts: any;
  @Input() selectedCollection: any;
  supplierData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    console.log(this.selectedCollection)
    this.getVendorsData();
    this.getProducts();
  };
  getVendorsData() {
    this._VendorsService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
    });
  }
  getProducts() {
    let params = {
      view_imprint_products: true,
      collection_id: this.selectedCollection.pk_collectionID
    }
    this._VendorsService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintProducts = [];
      if (res["data"][0].qryCollectionImprints) {
        const products = res["data"][0].qryCollectionImprints.split(',,');
        products.forEach(product => {
          const [pk_productID, productNumber, productName, pk_imprintID, location, companyName] = product.split('::');
          this.imprintProducts.push({ pk_productID, productNumber, productName, pk_imprintID, location, companyName });
        });
      }
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
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
