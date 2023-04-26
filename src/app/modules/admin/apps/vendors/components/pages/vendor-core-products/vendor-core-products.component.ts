import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddColor, AddImprintColor, AddImprintMethod, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod, UpdateLocation } from '../../vendors.types';

@Component({
  selector: 'app-vendor-core-products',
  templateUrl: './vendor-core-products.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorCoreProductsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  dataSource = [];
  displayedColumns: string[] = ['pid', 'spid', 'name'];
  totalUsers = 0;
  page = 1;
  not_available = 'N/A';
  supplierData: any;
  isLoadMore: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getVendorsData();
  };
  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.getProducts(1);
    })
  }
  getProducts(page) {
    let params = {
      company_cores: true,
      company_id: this.supplierData.pk_companyID,
      page: page,
      size: 20
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.products = [];
        let productIDs = element.productIDs.split(',');
        productIDs.forEach(product => {
          let products = product.split(':');
          element.products.push({
            id: products[0],
            number: products[1],
            name: products[2]
          })
        });
      });
      this.dataSource = this.dataSource.concat(res["data"]);
      this.totalUsers = res["totalRecords"];
      this.isLoading = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData() {
    this.page++;
    this.isLoadMore = true;
    this.getProducts(this.page);
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
