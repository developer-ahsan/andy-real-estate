import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-store-suppliers',
  templateUrl: './store-suppliers.component.html'
})
export class StoreSuppliersComponent implements OnInit, OnDestroy {

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['company', 'productName', 'percentage'];
  dataSource = [];
  searchDataSource = [];
  dataSourceLoading = false;
  searchValue : string = '';


  totalProductsCount: number = 0;
  totalPercentage: number = 0;

  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.dataSourceLoading = true;
        this.getSuppliers();
      });
  }
  getSuppliers() {
    let params = {
      view_supplier: true,
      store_id: this.selectedStore.pk_storeID
    }
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        this.dataSource.forEach(element => {
          this.totalProductsCount = this.totalProductsCount + element.productCount;
        });
        this.searchDataSource = this.dataSource;
        this.dataSourceLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  calculatePercentage(item, index) {
    let percentage = (item.productCount / this.totalProductsCount) * 100;
    item.percentage = percentage;
    if (index == this.dataSource.length - 1) {
      this.totalSumPercentage();
    }
    return percentage.toFixed(2);
  }
  totalSumPercentage() {
    if (this.totalPercentage == 0) {
      this.dataSource.forEach(element => {
        this.totalPercentage = this.totalPercentage + element.percentage;
      });
    }
  }
  searchCompany(value) {
    this.searchValue = value
    if (this.searchValue != '') {
      this.dataSource = this.searchDataSource.filter(res => {
        return res.companyName.toLowerCase().includes(this.searchValue.toLowerCase());
      })
    } else {
      this.dataSource = this.searchDataSource;
    }
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
