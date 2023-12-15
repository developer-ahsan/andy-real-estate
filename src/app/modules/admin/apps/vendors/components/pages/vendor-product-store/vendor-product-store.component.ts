import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import * as Excel from 'exceljs/dist/exceljs.min.js';

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
  isLoadingExcel: boolean = false;

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
      company_id: this.supplierData.pk_companyID,
      page: page,
      size: 10
    }
    this._vendorService.getVendorsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(store => {
        store.productsData = [];
        if (store.products) {
          const products = store.products.split(',,');
          products.forEach(product => {
            const [pk_storeProductID, pk_productID, productName, productNumber, blnActive, StoreActive] = product.split('::');
            let blnStoreActive = false;
            if (StoreActive == 1) {
              blnStoreActive = true;
            }
            store.productsData.push({ pk_storeProductID, pk_productID, productName, productNumber, blnActive, blnStoreActive });
          });
        }
      });
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
  downloadProductsExcelWorkSheet(): void {
    this.isLoadingExcel = true;
    const params = {
      products_by_store: true,
      company_id: this.supplierData.pk_companyID,
      size: this.totalUsers
    };

    this._vendorService
      .getVendorsData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (res) => {
          const fileName = `${this.supplierData.pk_companyID}_storeProductsList`;
          const workbook = new Excel.Workbook();
          const worksheet = workbook.addWorksheet("My Sheet");

          worksheet.columns = [
            { header: "PRODUCT NAME", key: "productName", width: 50 },
            { header: "PRODUCT NUMBER", key: "productNumber", width: 40 },
          ];

          worksheet.addRows([
            { productName: '' },
            { productName: 'Product Listing Per Store for ' + this.supplierData.companyName },
            { productName: '' },
          ]);

          for (const store of res["data"]) {
            worksheet.addRows([
              { productName: '' },
              { productName: store.storeName },
              { productName: '' },
            ]);

            if (store.products) {
              const products = store.products.split(',,');
              products.forEach((product) => {
                const [pk_storeProductID, pk_productID, productName, productNumber, blnActive, StoreActive] = product.split('::');
                const blnStoreActive = StoreActive === '1';
                worksheet.addRow({ pk_storeProductID, pk_productID, productName, productNumber, blnActive, blnStoreActive });
              });
            }
          }

          workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

            document.body.appendChild(a);
            a.setAttribute("style", "display: none");
            a.href = url;
            a.download = `${fileName}.xlsx`;
            a.click();

            window.URL.revokeObjectURL(url);
            a.remove();
          });

          this.isLoadingExcel = false;
          this.isLoadMore = false;
          this._changeDetectorRef.markForCheck();
        },
        (err) => {
          this.isLoadingExcel = false;
          this.isLoadMore = false;
          this._changeDetectorRef.markForCheck();
        }
      );

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
