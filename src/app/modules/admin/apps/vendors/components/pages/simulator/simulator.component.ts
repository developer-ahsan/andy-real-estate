import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../vendors.service';
import { AddImprintMethod, DeleteImprintColor, UpdateImprintMethod, UpdateStoreStatus } from '../../vendors.types';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class SimulatorComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['name', 'action'];
  totalUsers = 0;
  tempRecords = 0;
  page = 1;

  mainScreen: string = 'Current Promo Codes';
  keyword = '';
  not_available = 'N/A';


  isSearching: boolean = false;

  // Add Method
  ngName: string = '';
  ngDesc: string = '';
  isAddMethodLoader: boolean = false;

  // Update Color
  isUpdateStoresLoader: boolean = false;
  isUpdateMethod: boolean = false;
  updateMethodData: any;
  ngRGBUpdate = '';
  stores: any;

  searchID: any = '';
  searchLoader: boolean = false;
  storeProductData: any;
  pricingData: any = 0;
  ngZipCode = '44321';

  isFirstStepLoading: boolean = false;
  ColorData: any;
  SizesData: any;
  colorLength = [];
  packagesData: any;
  imprintsData: any;
  percentages = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  percentageVal = 20;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._systemService.stores$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.stores = res["data"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
    // this.getImprintMethods(1, 'get');
  };
  calledScreen(value) {
    this.mainScreen = value;
  }
  getStoreProductData() {
    if (this.searchID == '') {
      this._systemService.snackBar('Please Enter Store Product Id');
      return;
    }
    this.searchLoader = true;
    let params = {
      store_product: true,
      store_product_id: this.searchID
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        if (res["pricing"].length > 0) {
          this.pricingData = res["pricing"][0].quantity;
        }
        this.storeProductData = res["data"][0];
        if (!this.ColorData || !this.SizesData) {
          this.isFirstStepLoading = true;
          this.getColors();
        }
      } else {
        this._systemService.snackBar('No store product found');
      }
      this.searchLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.searchLoader = false;
      this._systemService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    })
  }
  getColors() {
    let params = {
      simulator_color: true,
      size: 200,
      store_product_id: this.storeProductData.pk_storeProductID
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.ColorData = res["data"];
      if (this.ColorData.length > 10) {
        for (let index = 0; index < 10; index++) {
          this.colorLength.push({ colorName: '', id: '', size: '', qty: '' });
        }
      } else {
        for (let index = 0; index < this.ColorData.length; index++) {
          this.colorLength.push({ colorName: '', id: '', size: '', qty: '' });
        }
      }
      this.getSizes();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.searchLoader = false;
      this._systemService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    })
  }
  getSizes() {
    let params = {
      simulator_sizes: true,
      product_id: this.storeProductData.fk_productID,
      size: 200
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isFirstStepLoading = false;
      this.SizesData = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isFirstStepLoading = false;
      this._systemService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    })
  }
  backToSearch() {
    this.packagesData = null;
    this.imprintsData = null;
    this.colorLength = [];
    this.SizesData = null;
    this.ColorData = null;
    this.storeProductData = null;
  }
  selectionChange(event) {
    const { selectedIndex, previouslySelectedIndex } = event;
    if (selectedIndex == 1) {
    } else if (selectedIndex == 2) {
      if (!this.imprintsData) {
        this.getImprints();
      }
    } else if (selectedIndex == 3) {
    }
  }
  getPackages() {
    let params = {
      simulator_packaging: true,
      product_id: this.storeProductData.fk_productID,
      size: 200
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.packagesData = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    })
  }
  getImprints() {
    let params = {
      simulator_imprints: true,
      store_product_id: this.storeProductData.pk_storeProductID,
      size: 200
    }
    this._systemService.getSystemsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintsData = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._systemService.snackBar('Something went wrong');
      this._changeDetectorRef.markForCheck();
    })
  }
  createRange(number) {
    // return new Array(number);
    return new Array(number).fill(0)
      .map((n, index) => index + 1);
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
