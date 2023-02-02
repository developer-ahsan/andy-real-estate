import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';

@Component({
  selector: 'app-vendor-product-store',
  templateUrl: './vendor-product-store.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorProductsStoreComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  displayedColumns: string[] = ['id', 'number', 'name', 'active', 'ordered', 'video'];
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
      this.getProductsData(1);
    })
  }
  getProductsData(page) {
    let params = {
      products_by_store: true,
      page: page,
      size: 20,
      company_id: this.supplierData.pk_companyID
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = this.dataSource.concat(res["data"]);
      this.totalUsers = res["totalRecords"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this.isLoadMore = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData() {
    this.isLoadMore = true;
    this.page++;
    this.getProductsData(this.page);
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