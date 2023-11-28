import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-profit-calculator',
  templateUrl: './profit-calculator.component.html'
})
export class ProfitCalculatorComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  pricingData: any;
  quantityData: any = [];
  priceData: any = [];
  costData: any = [];
  blankData: any = [];
  blankCostData: any = [];

  ngAverageQty = 0;
  ngAveragePrice = 0;
  ngAverageCost = 0;
  ngAverageMargin = 33.33
  ngUnitGross = 0;
  ngUnitProfit = 0;
  ngGrossProfit = 0;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this.isLoading = true;
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getPricing();
    });
  }
  getPricing() {
    let params = {
      profit_table: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.pricingData = res["data"];
      if (this.pricingData.length > 2) {
        this.ngAverageQty = Math.ceil(this.pricingData[0].quantity + ((this.pricingData[1].quantity - this.pricingData[0].quantity) / 2));
        this.ngAverageCost = this.pricingData[0].cost;
        this.ngAveragePrice = this.ngAverageCost / (1 - (this.ngAverageMargin / 100));
        this.ngAveragePrice = Math.ceil(this.ngAveragePrice * 100 - 0.000001) / 100;
        this.ngUnitProfit = this.ngAveragePrice - this.ngAverageCost;
        this.ngUnitGross = Math.ceil((this.ngAveragePrice * 100 - 0.000001) / 100);
        this.ngGrossProfit = this.ngUnitProfit * this.ngAverageQty;
      }
      res["data"].forEach((element, index) => {
        this.quantityData.push(element.quantity);
        this.priceData.push(element.price);
        this.costData.push(element.cost);
        this.blankData.push(element.blankPrice);
        this.blankCostData.push(element.blankCost);
      });
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  calculateProfit() {
    let paylaod = {
      margin: this.ngAverageMargin,
      quantity: this.ngAverageQty
    }
    paylaod = this._commonService.replaceNullSpaces(paylaod);
    if (!paylaod.margin || !paylaod.quantity) {
      this._commonService.snackBar('Please specify store margins before using the profit calculator.');
      return;
    }
    if (!this.ngAverageMargin || !this.ngAverageQty) {
      this._storeService.snackBar('Please check input fields');
      return;
    }
    this.ngAverageCost = this.pricingData[0].cost;
    this.ngAveragePrice = this.ngAverageCost / (1 - (this.ngAverageMargin / 100));
    this.ngAveragePrice = Math.ceil(this.ngAveragePrice * 100 - 0.000001) / 100;
    this.ngUnitProfit = this.ngAveragePrice - this.ngAverageCost;
    this.ngUnitGross = Math.ceil((this.ngAveragePrice * 100 - 0.000001) / 100);
    this.ngGrossProfit = this.ngUnitProfit * this.ngAverageQty;
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
