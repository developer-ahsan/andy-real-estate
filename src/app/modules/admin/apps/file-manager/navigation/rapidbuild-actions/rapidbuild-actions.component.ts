import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * @title Basic use of `<table mat-table>`
 */

@Component({
  selector: 'app-rapidbuild-actions',
  templateUrl: './rapidbuild-actions.component.html'
})

export class RapidbuildActionsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['spid', 'name', 'master', 'store'];
  dataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.dataSourceLoading = true;
        this.getMainStoreCall(this.page);
      });
  }

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this._storeManagerService.getStoreProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];

        let extractedProducts = [];

        this.dataSource.forEach(item => {
          let productsList = item.productsList.split(",,");

          productsList.forEach(product => {
            let productAttributes = product.split("==");
            let productObject = {
              pk_storeProductID: productAttributes[0],
              productName: productAttributes[1],
              companyName: productAttributes[2],
              vendorRelation: productAttributes[3],
              lastUpdatedDate: productAttributes[4],
              blnActive: productAttributes[5],
              blnStoreActive: productAttributes[6],
              specialDescriptionExists: productAttributes[7],
              someValue1: productAttributes[8],
              videoExists: productAttributes[9],
              productColorExists: productAttributes[10],
              technoLogoExists: productAttributes[11],
              orderExists: productAttributes[12],
            }
            extractedProducts.push(productObject);
          });
        });

        this.dataSource = extractedProducts;
        this.dataSourceTotalRecord = response["totalRecords"];
        this.dataSourceLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  fileExists(item) {
    return true;
  }

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getMainStoreCall(this.page);
  };

  navigate(data) {
    this.router.navigateByUrl(`/apps/ecommerce/inventory/storeProduct/${data.pk_storeProductID}/pricing`);
  }


  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
