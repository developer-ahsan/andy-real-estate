import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';
import { UpdatePricing } from '../../store.types';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html'
})
export class PricingComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean = true;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  pricingData: any;
  quantityData = [];
  priceData = [];
  costData = [];
  blankData = [];
  blankCostData = [];
  netCostForm: FormGroup;
  isUpdateLoading: boolean = false;

  stores = [];
  storesTotal = 0;
  storePage = 1;
  storeLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    this.initialize();
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getPricing();
      this.getStoresVersions(1);
    });
  }
  initialize() {
    this.netCostForm = this._formBuilder.group({
      quantityOne: [''],
      quantityTwo: [''],
      quantityThree: [''],
      quantityFour: [''],
      quantityFive: [''],
      quantitySix: [''],
      marginOne: [''],
      marginTwo: [''],
      marginThree: [''],
      marginFour: [''],
      marginFive: [''],
      marginSix: [''],
      priceOverrideOne: [''],
      priceOverrideTwo: [''],
      priceOverrideThree: [''],
      priceOverrideFour: [''],
      priceOverrideFive: [''],
      priceOverrideSix: [''],
      tccdPriceOne: [''],
      tccdPriceTwo: [''],
      tccdPriceThree: [''],
      tccdPriceFour: [''],
      tccdPriceFive: [''],
      tccdPriceSix: [''],
      targetOne: [''],
      targetTwo: [''],
      targetThree: [''],
      targetFour: [''],
      targetFive: [''],
      targetSix: ['']
    });
  }

  getPricing() {
    this.isLoading = true;
    this.isLoadingChange.emit(true);
    let params = {
      pricing: true,
      store_product_id: this.selectedProduct.pk_storeProductID,
      store_id: this.selectedProduct.fk_storeID
    }
    this.priceData = [];
    this.quantityData = [];
    this.costData = [];
    this.blankCostData = [];
    this.blankData = [];
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.pricingData = res;
      res.current_pricing[0].forEach(element => {
        this.quantityData.push(element.quantity);
        this.priceData.push(element.price);
        this.costData.push(element.cost);
        this.blankData.push(element.blankPrice);
        this.blankCostData.push(element.blankCost);
      });
      let quantity = {
        quantityOne: '',
        quantityTwo: '',
        quantityThree: '',
        quantityFour: '',
        quantityFive: '',
        quantitySix: '',
        marginOne: '',
        marginTwo: '',
        marginThree: '',
        marginFour: '',
        marginFive: '',
        marginSix: '',
        priceOverrideOne: '',
        priceOverrideTwo: '',
        priceOverrideThree: '',
        priceOverrideFour: '',
        priceOverrideFive: '',
        priceOverrideSix: '',
        tccdPriceOne: '',
        tccdPriceTwo: '',
        tccdPriceThree: '',
        tccdPriceFour: '',
        tccdPriceFive: '',
        tccdPriceSix: '',
      };
      res.margins.forEach((element, index) => {
        if (index == 0) {
          quantity.quantityOne = element.quantity;
          quantity.marginOne = String(element.margin * 100);
          if (element.priceOverride) {
            quantity.priceOverrideOne = String(element.priceOverride * 100);
          }
          if (element.tccdprice) {
            quantity.tccdPriceOne = String(element.tccdprice * 100);
          }
        } else if (index == 1) {
          quantity.quantityTwo = element.quantity;
          quantity.marginTwo = String(element.margin * 100);
          if (element.priceOverride) {
            quantity.priceOverrideTwo = String(element.priceOverride * 100);
          }
          if (element.tccdprice) {
            quantity.tccdPriceTwo = String(element.tccdprice * 100);
          }
        } else if (index == 2) {
          quantity.quantityThree = element.quantity;
          quantity.marginThree = String(element.margin * 100);
          if (element.priceOverride) {
            quantity.priceOverrideThree = String(element.priceOverride * 100);
          }
          if (element.tccdprice) {
            quantity.tccdPriceThree = String(element.tccdprice * 100);
          }
        } else if (index == 3) {
          quantity.quantityFour = element.quantity;
          quantity.marginFour = String(element.margin * 100);
          if (element.priceOverride) {
            quantity.priceOverrideFour = String(element.priceOverride * 100);
          }
          if (element.tccdprice) {
            quantity.tccdPriceFour = String(element.tccdprice * 100);
          }
        } else if (index == 4) {
          quantity.quantityFive = element.quantity;
          quantity.marginFive = String(element.margin * 100);
          if (element.priceOverride) {
            quantity.priceOverrideFive = String(element.priceOverride * 100);
          }
          if (element.tccdprice) {
            quantity.tccdPriceFive = String(element.tccdprice * 100);
          }
        } else if (index == 5) {
          quantity.quantitySix = element.quantity;
          quantity.marginSix = String(element.margin * 100);
          if (element.priceOverride) {
            quantity.priceOverrideSix = String(element.priceOverride * 100);
          }
          if (element.tccdprice) {
            quantity.tccdPriceSix = String(element.tccdprice * 100);
          }
        }
      });
      if (res.margins.length == 0) {
        res.quantities.forEach((element, index) => {
          if (index == 0) {
            quantity.quantityOne = element.quantity;
          } else if (index == 1) {
            quantity.quantityTwo = element.quantity;
          } else if (index == 2) {
            quantity.quantityThree = element.quantity;
          } else if (index == 3) {
            quantity.quantityFour = element.quantity;
          } else if (index == 4) {
            quantity.quantityFive = element.quantity;
          } else if (index == 5) {
            quantity.quantitySix = element.quantity;
          }
        });
      }
      this.netCostForm.patchValue(quantity)
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  updateQuantity(str: string) {
    const netCostFormValues = this.netCostForm.getRawValue();
    if (str == "quantityTwo") {
      const { quantityOne } = netCostFormValues;
      this.netCostForm.patchValue({
        quantityTwo: quantityOne * 2
      });
    } else if (str == "quantityThree") {
      const { quantityTwo } = netCostFormValues;
      this.netCostForm.patchValue({
        quantityThree: quantityTwo * 2
      });
    } else if (str == "quantityFour") {
      const { quantityThree } = netCostFormValues;
      this.netCostForm.patchValue({
        quantityFour: quantityThree * 2
      });
    } else if (str == "quantityFive") {
      const { quantityFour } = netCostFormValues;
      this.netCostForm.patchValue({
        quantityFive: quantityFour * 2
      });
    } else if (str == "quantitySix") {
      const { quantityFive } = netCostFormValues;
      this.netCostForm.patchValue({
        quantitySix: quantityFive * 2
      });
    };

  };
  clearMargins() {
    this.netCostForm.patchValue({
      marginOne: '',
      marginTwo: '',
      marginThree: '',
      marginFour: '',
      marginFive: '',
      marginSix: ''
    })
  }
  clearTargets() {
    this.netCostForm.patchValue({
      targetOne: '',
      targetTwo: '',
      targetThree: '',
      targetFour: '',
      targetFive: '',
      targetSix: ''
    })
  }
  setMarginValues(val) {
    const { margin1, margin2, margin3, margin4, margin5, margin6, apparelMargin1, apparelMargin2, apparelMargin3, apparelMargin4, apparelMargin5, apparelMargin6, printMargin1, printMargin2, printMargin3, printMargin4, printMargin5, printMargin6 } = this.pricingData.current_pricing[1][0];
    if (val == 1) {
      this.netCostForm.patchValue({
        marginOne: margin1 * 100,
        marginTwo: margin2 * 100,
        marginThree: margin3 * 100,
        marginFour: margin4 * 100,
        marginFive: margin5 * 100,
        marginSix: margin6 * 100
      })
    } else if (val == 2) {
      this.netCostForm.patchValue({
        marginOne: apparelMargin1 * 100,
        marginTwo: apparelMargin2 * 100,
        marginThree: apparelMargin3 * 100,
        marginFour: apparelMargin4 * 100,
        marginFive: apparelMargin5 * 100,
        marginSix: apparelMargin6 * 100
      })
    } else if (val == 3) {
      this.netCostForm.patchValue({
        marginOne: printMargin1 * 100,
        marginTwo: printMargin2 * 100,
        marginThree: printMargin3 * 100,
        marginFour: printMargin4 * 100,
        marginFive: printMargin5 * 100,
        marginSix: printMargin6 * 100
      })
    }
  }
  UpdatePricing() {
    this.isUpdateLoading = true;
    const { quantityOne, quantityTwo, quantityThree, quantityFour, quantityFive, quantitySix, marginOne, marginTwo, marginThree, marginFour, marginFive, marginSix, priceOverrideOne, priceOverrideTwo, priceOverrideThree, priceOverrideFour, priceOverrideFive, priceOverrideSix, tccdPriceOne, tccdPriceTwo, tccdPriceThree, tccdPriceFour, tccdPriceFive, tccdPriceSix } = this.netCostForm.getRawValue();
    const m1 = Number(marginOne) / 100;
    const m2 = Number(marginTwo) / 100;
    const m3 = Number(marginThree) / 100;
    const m4 = Number(marginFour) / 100;
    const m5 = Number(marginFive) / 100;
    const m6 = Number(marginSix) / 100;
    const q1 = Number(quantityOne);
    const q2 = Number(quantityTwo);
    const q3 = Number(quantityThree);
    const q4 = Number(quantityFour);
    const q5 = Number(quantityFive);
    const q6 = Number(quantitySix);
    const p1 = Number(priceOverrideOne);
    const p2 = Number(priceOverrideTwo);
    const p3 = Number(priceOverrideThree);
    const p4 = Number(priceOverrideFour);
    const p5 = Number(priceOverrideFive);
    const p6 = Number(priceOverrideSix);
    const t1 = Number(tccdPriceOne);
    const t2 = Number(tccdPriceTwo);
    const t3 = Number(tccdPriceThree);
    const t4 = Number(tccdPriceFour);
    const t5 = Number(tccdPriceFive);
    const t6 = Number(tccdPriceSix);
    let Quantities = [];
    Quantities.push({ quantity: q1, margin: m1 });
    Quantities.push({ quantity: q2, margin: m2 });
    Quantities.push({ quantity: q3, margin: m3 });
    Quantities.push({ quantity: q4, margin: m4 });
    Quantities.push({ quantity: q5, margin: m5 });
    Quantities.push({ quantity: q6, margin: m6 });
    let prices = [];
    const { pk_storeProductID, storeName } = this.selectedProduct;
    prices.push({ quantity: q1, margin: m1, priceOverride: p1, tccdPrice: t1 });
    prices.push({ quantity: q2, margin: m2, priceOverride: p2, tccdPrice: t2 });
    prices.push({ quantity: q3, margin: m3, priceOverride: p3, tccdPrice: t3 });
    prices.push({ quantity: q4, margin: m4, priceOverride: p4, tccdPrice: t4 });
    prices.push({ quantity: q5, margin: m5, priceOverride: p5, tccdPrice: t5 });
    prices.push({ quantity: q6, margin: m6, priceOverride: p6, tccdPrice: t6 });
    let pricing_store_products = [];
    pricing_store_products.push({
      storeProductID: pk_storeProductID,
      storeName: storeName,
      pricesMargins: prices
    });
    this.stores.forEach(element => {
      if (element.checked) {
        pricing_store_products.push({
          storeProductID: element.pk_storeProductID,
          storeName: element.storeName,
          pricesMargins: prices
        });
      }
    });

    let payload: UpdatePricing = {
      pricing_store_products: pricing_store_products,
      product_id: Number(this.selectedProduct.fk_productID),
      update_pricing: true
      // storeProductID: Number(this.selectedProduct.pk_storeProductID),
      // update_pricing: true,
      // product_id: Number(this.selectedProduct.fk_productID),
      // storeName: this.selectedProduct.storeName,
      // list: Quantities
    }
    this._storeService.UpdatePricing(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.isUpdateLoading = false;
      this._storeService.snackBar(res["message"]);
      this.getPricing();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getStoresVersions(page) {
    this.storeLoader = true;
    let params = {
      page: page,
      special_description_stores: true,
      store_product_id: this.selectedProduct.pk_storeProductID,
      product_id: this.selectedProduct.fk_productID,
      size: 20
    }
    this._storeService
      .getStoreProducts(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.stores = this.stores.concat(res["data"]);
        this.storesTotal = res["totalRecords"];
        this.storeLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.storeLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  selectUnselectAll(ev) {
    if (ev.checked) {
      this.stores.forEach(element => {
        element.checked = true;
      });
    } else {
      this.stores.forEach(element => {
        element.checked = false;
      });
    }
  }
  getNextStore() {
    this.storePage++;
    this.getStoresVersions(this.storePage);
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
