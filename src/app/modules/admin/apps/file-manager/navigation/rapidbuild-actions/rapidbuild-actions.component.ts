import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomersService } from '../../../ecommerce/customers/customers.service';
import { FormsModule } from '@angular/forms';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

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
  isMasterCheckboxChecked: boolean = false;
  selectedProduct: any = []
  selectedAction: any = 0;
  updateLoader: boolean = false;
  finalProducts: any;
  totalRecords = 0;
  constructor(
    public _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _customerService: CustomersService,
    private router: Router,
    private _commonService: DashboardsService,

  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.getMainStoreCall(this.page);
      });
  }


  toggleAllCheckboxes() {
    this.dataSource.forEach(item => {
      item.isChecked = this.isMasterCheckboxChecked;
    });
  }

  getMainStoreCall(page) {
    const { pk_storeID } = this.selectedStore;

    // Get the offline products
    this.dataSourceLoading = true;
    this._storeManagerService.getStoreProducts(pk_storeID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.totalRecords = response["totalRecords"];
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
              isChecked: false
            }
            // this.fileExists(productObject)
            extractedProducts.push(productObject);

          });
          item['splittedData'] = extractedProducts
          extractedProducts = [];
        });
        this.dataSourceLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.dataSourceLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  };

  getRandom() {
    return Math.random();
  }

  fileExists(item) {
    if (item?.pk_storeProductID) {
      const url = `https://assets.consolidus.com/globalAssets/Products/Thumbnails/${item?.pk_storeProductID}.jpg`
      const img = new Image();
      img.src = url;
      img.onload = () => {
        item.imageExit = true;
        this._changeDetectorRef.markForCheck()
      };
      img.onerror = () => {
        item.imageExit = false;
        this._changeDetectorRef.markForCheck()
      };
    }
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

  toggleCheckbox(item: any) {
    const index = this.selectedProduct.indexOf(item);
    if (index === -1) {
      this.selectedProduct.push(item);
    } else {
      this.selectedProduct.splice(index, 1);
    }
  }
  update() {

    if (this.selectedProduct?.length < 1) {
      this._customerService.snackBar('Please select products to update');
      return;
    }
    if (this.selectedAction == 0) {
      this._customerService.snackBar('Please select an action');
      return;
    }
    this.finalProducts = this.selectedProduct.map(item => {
      return { storeProductID: item.pk_storeProductID };
    });
    const payload = {
      rapid_build_store_products: this.finalProducts,
      image_status_id: this.selectedAction == 'delete' ? 1 : 0,
      add_rapidBuild_storeProduct_bulk: true
    }
    this.updateLoader = true;
    this._storeManagerService.postProductData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this._customerService.snackBar('Products updated successfuly');
        if (this.selectedAction === 'delete') {
          this.removeFiles();
          this.getMainStoreCall(this.page)
        }
        this._changeDetectorRef.markForCheck();
        this.updateLoader = false;
      }), err => {
        this.updateLoader = false;
        this._customerService.snackBar('Error occured while updating product');
        this._changeDetectorRef.markForCheck();
      }

  }

  removeFiles() {
    const tempImages = this.finalProducts
      .map(item => `/globalAssets/Products/Thumbnails/${item.storeProductID}.jpg`);
    if (tempImages.length > 0) {
      let payload = {
        files: tempImages,
        delete_multiple_files: true
      }
      this._commonService.removeMediaFiles(payload)
        .subscribe((response) => {
          this._customerService.snackBar('Products updated successfuly');
          this._changeDetectorRef.markForCheck();
        }, err => {
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._changeDetectorRef.markForCheck();
    }
  }


  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
