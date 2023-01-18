import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { VendorsService } from '../../vendors.service';
import { AddColor, AddSize, DeleteColor, DeleteSize, UpdateColor, UpdateSize } from '../../vendors.types';

@Component({
  selector: 'app-product-system-sizes',
  templateUrl: './sizes.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class SizesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'order', 'products', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Sizes';
  keyword = '';
  not_available = 'N/A';

  isSearching: boolean = false;

  // Add Size 
  ngSizeName: string = '';
  ngSizeOrder: number = 0;
  isAddSizeLoader: boolean = false;

  // Update Size
  isUpdateSizeLoader: boolean = false;
  checkBoxesList = [];

  // Delete Size
  isDeleteLoader: boolean = false;

  // Products List 
  productData: any;
  productDataRecords = 0;
  productDataPage = 1;
  productSizeID = null;
  isProductLoader: boolean = false;
  displayedProductColumns: string[] = ['id', 'name', 'number', 'active'];
  isProductSizes: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _VendorsService: VendorsService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getSizes(1, 'get');
  };
  calledScreen(value) {
    this.mainScreen = value;
  }
  getSizes(page, type) {
    let params = {
      product_sizes: true,
      keyword: this.keyword,
      page: page,
      size: 20
    }
    this._VendorsService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dataSource = res["data"];
      this.totalUsers = res["totalRecords"];
      if (this.keyword == '') {
        this.tempDataSource = res["data"];
        this.tempRecords = res["totalRecords"];
      }
      this.isLoading = false;
      this.isSearching = false;
      if (type == 'delete') {
        this.isDeleteLoader = false;
        this._VendorsService.snackBar('Sizes Deleted Successfully');
      }
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearching = false;
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSizes(this.page, 'get');
  };
  searchSize(value) {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = value;
    this.isSearching = true;
    this._changeDetectorRef.markForCheck();
    this.getSizes(1, 'get');
  }
  resetSearch() {
    if (this.dataSource.length > 0) {
      this.paginator.firstPage();
    }
    this.keyword = '';
    this.dataSource = this.tempDataSource;
    this.totalUsers = this.tempRecords;
  }
  // Get Product List 
  backToSizesList() {
    this.isProductSizes = false;
  }
  getSizeProducts(page, item) {
    if (item) {
      this.isProductSizes = true;
      this.isProductLoader = true;
      this.productSizeID = item.pk_sizeID;
    }
    let params = {
      product_per_sizes: true,
      size_id: this.productSizeID,
      page: page,
      size: 20
    }
    this._VendorsService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.productData = res["data"];
      this.productDataRecords = res["totalRecords"];
      this.isProductLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isProductLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getNextProductData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.productDataPage++;
    } else {
      this.productDataPage--;
    };
    this.getSizes(this.productDataPage, null);
  };
  // Add new Size
  addNewSize() {
    if (this.ngSizeName == '') {
      this._VendorsService.snackBar('Size is required');
      return;
    }
    let payload: AddSize = {
      list_order: this.ngSizeOrder,
      size_name: this.ngSizeName,
      add_size: true
    }
    this.isAddSizeLoader = true;
    this._VendorsService.AddSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isAddSizeLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this.getSizes(1, 'get');
        this.ngSizeName = '';
        this.ngSizeOrder = 0;
        this._VendorsService.snackBar('Size Added Successfully');
      } else {
        this._VendorsService.snackBar(res["message"]);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    });
  }
  // Delete Color
  deleteSizes() {
    if (this.checkBoxesList.length == 0) {
      this._VendorsService.snackBar('Please select minimum one size');
      return;
    }
    let payload: DeleteSize = {
      size_id: this.checkBoxesList,
      delete_size: true
    }
    this.isDeleteLoader = true;
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.keyword = '';
      this.checkBoxesList = [];
      this.getSizes(1, 'delete');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    });
  }
  // Update Color
  addNewCheckBox(ev, item) {
    const index = this.checkBoxesList.findIndex(elem => elem == item.pk_sizeID);
    if (ev.checked) {
      if (index < 0) {
        this.checkBoxesList.push(item.pk_sizeID);
      }
    } else {
      if (index >= 0) {
        this.checkBoxesList.splice(index, 1);
      }
    }
  }
  updateSizes() {
    let sizes = [];
    this.dataSource.forEach(element => {
      sizes.push({
        size_name: element.sizeName,
        list_order: element.listOrder,
        size_id: element.pk_sizeID
      })
    });
    let payload: UpdateSize = {
      sizes: sizes,
      update_size: true
    }
    this.isUpdateSizeLoader = true;
    this._VendorsService.UpdateSystemData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isUpdateSizeLoader = false
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._VendorsService.snackBar('Sizes Updated Successfully');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._VendorsService.snackBar('Something went wrong');
    })
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
