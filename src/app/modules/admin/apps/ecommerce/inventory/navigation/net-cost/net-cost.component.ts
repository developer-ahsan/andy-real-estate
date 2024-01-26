import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatSnackBar } from '@angular/material/snack-bar';
import _ from 'lodash';

@Component({
  selector: 'app-net-cost',
  templateUrl: './net-cost.component.html'
})
export class NetCostComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedorder: string = 'select_order';
  flashMessage: 'success' | 'error' | null = null;
  netCostForm: FormGroup;
  products: string[] = [];
  netCostLoader = false;
  validationCheckMessage = "";

  selectedDropdown;
  isDropdownDisabled = true;

  netCostFetchLoader = false;

  coOpProgramSettings: IDropdownSettings = {};
  selectedCoOpProgram = [];
  coops = [];
  selectedCooP = null;
  isCustomRedPrice: boolean = false

  redPriceDropdownSettings: IDropdownSettings = {};
  selectedRedPriceItems = [];
  selectedRedPrice: string;
  redPriceList = [
    { item_id: 1, item_text: 'Price does not include imprint. You may add desired imprint(s) during the checkout process for an additional cost' },
    { item_id: 2, item_text: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost' },
    { item_id: 3, item_text: 'Price includes a one color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 4, item_text: 'Price includes a laser engraved/one location imprint. Setups and any other additional fees may apply andwill be disclosed prior to checkout' },
    { item_id: 5, item_text: 'Price includes a laser etched/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 6, item_text: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost' },
    { item_id: 7, item_text: 'Price includes a full color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 8, item_text: 'Price includes a deboss/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 9, item_text: 'Price includes imprint, setup, and run fees' },
    { item_id: 10, item_text: 'Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 11, item_text: 'Item is sold blank' }
  ];
  redPriceCommentText = "";

  distributionCodes = [];
  netCostDefaultStandardCost;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.netCostForm = this._formBuilder.group({
      quantityOne: [''],
      quantityTwo: [''],
      quantityThree: [''],
      quantityFour: [''],
      quantityFive: [''],
      quantitySix: [''],
      standardCostOne: [''],
      standardCostTwo: [''],
      standardCostThree: [''],
      standardCostFour: [''],
      standardCostFive: [''],
      standardCostSix: [''],
      standardCostDropOne: [''],
      standardCostDropTwo: [''],
      standardCostDropThree: [''],
      standardCostDropFour: [''],
      standardCostDropFive: [''],
      standardCostDropSix: [''],
      blankCostOne: [''],
      blankCostTwo: [''],
      blankCostThree: [''],
      blankCostFour: [''],
      blankCostFive: [''],
      blankCostSix: [''],
      msrp: [''],
      internalComments: ['']
    });

    this.redPriceDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      limitSelection: 1
    };

    this.coOpProgramSettings = {
      singleSelection: false,
      idField: 'pk_coopID',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      limitSelection: 1,
      noDataAvailablePlaceholderText: "No Co-op programs found"
    };
    this._inventoryService.distributionCodes$
      .subscribe((response) => {
        this.distributionCodes = response["data"];
        const countryDefault = this.distributionCodes.find(c => c.distrDiscount == -1);
        this.netCostForm.patchValue({
          standardCostDropOne: countryDefault,
          standardCostDropTwo: countryDefault,
          standardCostDropThree: countryDefault,
          standardCostDropFour: countryDefault,
          standardCostDropFive: countryDefault,
          standardCostDropSix: countryDefault
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.getProductDetail();
  };
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getCoOps();
        const { liveCostComment } = this.selectedProduct;
        if (liveCostComment) {
          if (this.redPriceList.some(e => e.item_text == liveCostComment)) {
            //In the array!
            this.isCustomRedPrice = false;
            this.selectedRedPriceItems.push(liveCostComment);
          } else {
            //Not in the array
            this.isCustomRedPrice = true;
            this.redPriceCommentText = liveCostComment;
          };
        };
        this.getNetCost();
      }
    });
  }
  getNetCost(): void {
    const { msrp, costComment, pk_productID } = this.selectedProduct;
    this._inventoryService.getNetCost(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((netCost) => {
        this.netCostDefaultStandardCost = {
          standardCostOne: netCost["data"][0]?.cost || "",
          standardCostTwo: netCost["data"][1]?.cost || "",
          standardCostThree: netCost["data"][2]?.cost || "",
          standardCostFour: netCost["data"][3]?.cost || "",
          standardCostFive: netCost["data"][4]?.cost || "",
          standardCostSix: netCost["data"][5]?.cost || ""
        };
        const formValues = {
          quantityOne: netCost["data"][0]?.quantity || "",
          quantityTwo: netCost["data"][1]?.quantity || "",
          quantityThree: netCost["data"][2]?.quantity || "",
          quantityFour: netCost["data"][3]?.quantity || "",
          quantityFive: netCost["data"][4]?.quantity || "",
          quantitySix: netCost["data"][5]?.quantity || "",
          standardCostOne: netCost["data"][0]?.cost.toFixed(3) || "",
          standardCostTwo: netCost["data"][1]?.cost.toFixed(3) || "",
          standardCostThree: netCost["data"][2]?.cost.toFixed(3) || "",
          standardCostFour: netCost["data"][3]?.cost.toFixed(3) || "",
          standardCostFive: netCost["data"][4]?.cost.toFixed(3) || "",
          standardCostSix: netCost["data"][5]?.cost.toFixed(3) || "",
          blankCostOne: netCost["data"][0]?.blankCost || "",
          blankCostTwo: netCost["data"][1]?.blankCost || "",
          blankCostThree: netCost["data"][2]?.blankCost || "",
          blankCostFour: netCost["data"][3]?.blankCost || "",
          blankCostFive: netCost["data"][4]?.blankCost || "",
          blankCostSix: netCost["data"][5]?.blankCost || "",
          msrp: msrp || "",
          internalComments: costComment || ""
        };

        this.netCostForm.patchValue(_.mapValues(formValues, v => v == "null" ? '' : v));

        // Main component loader setting to false
        this.isLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Net cost could not be fetched. Try Refreshing page", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Main component loader setting to false
        this.isLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getCoOps(): void {
    const { fk_supplierID, pk_productID } = this.selectedProduct;

    // Get the CoOps
    this._inventoryService.getProductCoops(fk_supplierID)
      .subscribe((coops) => {
        // Get the CoOps
        this._inventoryService.getSpecificProductCoops(pk_productID)
          .subscribe((coop) => {
            const selectedCoopResult = coop["data"];
            this.coops = coops["data"];
            if (selectedCoopResult.length) {
              this.selectedCoOpProgram = selectedCoopResult;
            };
            this.isDropdownDisabled = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      }, err => {
        this.getCoOps();

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  clearFields(): void {
    const countryDefault = this.distributionCodes.find(c => c.distrDiscount == -1);

    const sample = {
      standardCostOne: "",
      standardCostTwo: "",
      standardCostThree: "",
      standardCostFour: "",
      standardCostFive: "",
      standardCostSix: "",
      standardCostDropOne: countryDefault,
      standardCostDropTwo: countryDefault,
      standardCostDropThree: countryDefault,
      standardCostDropFour: countryDefault,
      standardCostDropFive: countryDefault,
      standardCostDropSix: countryDefault
    };
    this.netCostForm.patchValue(sample);
  };

  setDropdownValue(value: string) {
    this.selectedDropdown = this.distributionCodes.find(item => item.distrDiscountCode === value);
    const { distrDiscount } = this.selectedDropdown;

    const sample = {
      standardCostDropOne: this.selectedDropdown,
      standardCostDropTwo: this.selectedDropdown,
      standardCostDropThree: this.selectedDropdown,
      standardCostDropFour: this.selectedDropdown,
      standardCostDropFive: this.selectedDropdown,
      standardCostDropSix: this.selectedDropdown
    };

    this.netCostForm.patchValue(sample);
    if (this.netCostDefaultStandardCost) {
      const { standardCostOne, standardCostTwo, standardCostThree, standardCostFour, standardCostFive, standardCostSix } = this.netCostForm.getRawValue();
      const sample = {
        standardCostOne: standardCostOne ? Number((standardCostOne * (1 - distrDiscount)).toFixed(3)) : null,
        standardCostTwo: standardCostTwo ? Number((standardCostTwo * (1 - distrDiscount)).toFixed(3)) : null,
        standardCostThree: standardCostThree ? Number((standardCostThree * (1 - distrDiscount)).toFixed(3)) : null,
        standardCostFour: standardCostFour ? Number((standardCostFour * (1 - distrDiscount)).toFixed(3)) : null,
        standardCostFive: standardCostFive ? Number((standardCostFive * (1 - distrDiscount)).toFixed(3)) : null,
        standardCostSix: standardCostSix ? Number((standardCostSix * (1 - distrDiscount)).toFixed(3)) : null
      };

      this.netCostForm.patchValue(sample);
    };
  };

  changeIsCustom(): void {
    this.isCustomRedPrice = !this.isCustomRedPrice
  };

  onCoOpProgramSelect(item: any) {
    const { pk_coopID } = item;
    this.selectedCooP = pk_coopID;
  };

  fetchNetCost(): void {
    const { productNumber, fk_supplierID } = this.selectedProduct;
    this.netCostFetchLoader = true;
    this._inventoryService.getPromoStandardProductPricingDetails(productNumber, fk_supplierID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((productPricing) => {
        if (productPricing["data"]["success"]) {
          if (productPricing["data"]["result"]["Envelope"]["Body"]["GetConfigurationAndPricingResponse"]?.ErrorMessage?.description == "Data not found") {
            this._snackBar.open("No data found against this product number", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.netCostFetchLoader = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          } else {
            const pricingDataArray = productPricing["data"]["result"]["Envelope"]["Body"]["GetConfigurationAndPricingResponse"]["Configuration"]["PartArray"];
            const { blnApparel } = this.selectedProduct;
            let obj = {};

            if (blnApparel) {
              // Update Standard Cost
              if (pricingDataArray?.length) {
                for (let i = 0; i <= 5; i++) {
                  if (typeof (pricingDataArray[i]) == "object") {
                    if ("PartPriceArray" in pricingDataArray[i]) {
                      const { price } = pricingDataArray[i]["PartPriceArray"][0];
                      if (i == 0) {
                        obj["standardCostOne"] = price
                      }

                      if (i == 1) {
                        obj["standardCostTwo"] = price
                      }

                      if (i == 2) {
                        obj["standardCostThree"] = price
                      }

                      if (i == 3) {
                        obj["standardCostFour"] = price
                      }

                      if (i == 4) {
                        obj["standardCostFive"] = price
                        obj["standardCostSix"] = price
                      }

                      // if (i == 5) {
                      //   obj["standardCostSix"] = price
                      // }
                    }
                  }
                }
              } else {
                obj = {
                  standardCostOne: null,
                  standardCostTwo: null,
                  standardCostThree: null,
                  standardCostFour: null,
                  standardCostFive: null,
                  standardCostSix: null
                };
              }
            } else {
              // Updata Quantity and standard cost
              if (pricingDataArray?.length) {
                for (let i = 0; i <= 5; i++) {
                  if (typeof (pricingDataArray[i]) == "object") {
                    if ("PartPriceArray" in pricingDataArray[i]) {
                      const { minQuantity, price } = pricingDataArray[i]["PartPriceArray"][0];
                      if (i == 0) {
                        obj["quantityOne"] = minQuantity;
                        obj["standardCostOne"] = price;
                      }

                      if (i == 1) {
                        obj["quantityTwo"] = minQuantity + 1;
                        obj["standardCostTwo"] = price;
                      }

                      if (i == 2) {
                        obj["quantityThree"] = minQuantity + 2;
                        obj["standardCostThree"] = price;
                      }

                      if (i == 3) {
                        obj["quantityFour"] = minQuantity + 3;
                        obj["standardCostFour"] = price;
                      }

                      if (i == 4) {
                        obj["quantityFive"] = minQuantity + 4;
                        obj["standardCostFive"] = price;
                        obj["quantitySix"] = minQuantity + 5;
                        obj["standardCostSix"] = price;
                      }

                      // if (i == 5) {
                      //   obj["quantitySix"] = minQuantity;
                      //   obj["standardCostSix"] = price;
                      // }
                    }
                  }
                }
              } else {
                obj = {
                  quantityOne: null,
                  quantityTwo: null,
                  quantityThree: null,
                  quantityFour: null,
                  quantityFive: null,
                  quantitySix: null,
                  standardCostOne: null,
                  standardCostTwo: null,
                  standardCostThree: null,
                  standardCostFour: null,
                  standardCostFive: null,
                  standardCostSix: null
                };
              }
            };

            this.netCostForm.patchValue(obj);

            this._snackBar.open("Data fetched successfully", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.netCostFetchLoader = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }

        }
        this.netCostFetchLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured while fetching promo standards data", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.netCostFetchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  };

  onRedPriceItemSelect(item: any) {
    const { item_text } = item;
    this.redPriceCommentText = item_text;
  };

  removeNull(array) {
    return array.filter(x => x !== null)
  };

  isArraySorted(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i + 1] && (arr[i + 1] > arr[i])) {
        continue;
      } else if (arr[i + 1] && (arr[i + 1] < arr[i])) {
        return false;
      }
    }
    return true;
  }
  isArraySortedDesc(arr) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i + 1] && (arr[i + 1] < arr[i])) {
        continue;
      } else if (arr[i + 1] && (arr[i + 1] > arr[i])) {
        return false;
      }
    }
    return true;
  }

  checkIfArrayIsUnique(myArray) {
    return (new Set(myArray)).size !== myArray.length;
  }
  updateNetCost(): void {
    const formValues = this.netCostForm.getRawValue();
    const quantityListArray = [Number(formValues.quantityOne) || null, Number(formValues.quantityTwo) || null, Number(formValues.quantityThree) || null, Number(formValues.quantityFour) || null, Number(formValues.quantityFive) || null, Number(formValues.quantitySix) || null];
    const blankListArray = [parseInt(formValues.blankCostOne) || null, parseInt(formValues.blankCostTwo) || null, parseInt(formValues.blankCostThree) || null, parseInt(formValues.blankCostFour) || null, parseInt(formValues.blankCostFive) || null, parseInt(formValues.blankCostSix) || null];
    const standardCostList = [Number(formValues.standardCostOne) || null, Number(formValues.standardCostTwo) || null, Number(formValues.standardCostThree) || null, Number(formValues.standardCostFour) || null, Number(formValues.standardCostFive) || null, Number(formValues.standardCostSix) || null];

    const realQuantityList = this.removeNull(quantityListArray);

    const quantity_sort = this.isArraySorted(realQuantityList);
    const cost_sort = this.isArraySortedDesc(standardCostList);
    const quantity_unique = this.checkIfArrayIsUnique(realQuantityList);
    if (!quantity_sort) {
      this._snackBar.open("Quantity values must be entered in ascending order", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (quantity_unique) {
      this._snackBar.open("Quantity values must be unique", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (!cost_sort) {
      this._snackBar.open("Costs values must be entered in descending order", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }

    const realBlankList = this.removeNull(blankListArray);
    const realStandardCostList = this.removeNull(standardCostList);

    if (realQuantityList.length != realStandardCostList.length) {
      this._snackBar.open("Number of quantity list breaks must be equal to number of standard cost breaks", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    const { pk_productID } = this.selectedProduct;
    const payload = {
      product_id: parseInt(pk_productID),
      quantity_list: realQuantityList,
      cost_list: realStandardCostList,
      blank_cost_list: realBlankList,
      cost_comment: formValues.internalComments,
      live_cost_comment: this.redPriceCommentText || "",
      coop_id: this.selectedCooP || 0,
      msrp: Number(formValues.msrp),
      net_cost: true
    };

    this.netCostLoader = true;
    this._inventoryService.updateNetCost(payload)
      .subscribe((response) => {
        this._inventoryService.getProductByProductId(pk_productID)
          .subscribe((productDetails) => {
            this.showFlashMessage(
              response["success"] === true ?
                'success' :
                'error'
            );
            this.netCostLoader = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          })

      }, err => {
        this._snackBar.open("Some error occured while updating net cost", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.netCostLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  updateQuantityQuickLinks(str: string) {
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

  updateCost(event, selectField) {
    const { distrDiscount, distrDiscountCode } = event.value;
    const discountedValue = 1 - distrDiscount;
    if (distrDiscountCode == "COST") {
      return;
    };

    if (selectField == "standardCostOne") {

      if (distrDiscountCode == '0') {
        this.netCostForm.patchValue({
          standardCostOne: this.netCostDefaultStandardCost.standardCostOne
        });
      }
      const { standardCostOne } = this.netCostForm.getRawValue();
      this.netCostForm.patchValue({
        standardCostOne: standardCostOne ? Number((standardCostOne * discountedValue)).toFixed(3) : null
      });

    } else if (selectField == "standardCostTwo") {

      if (distrDiscountCode == '0') {
        this.netCostForm.patchValue({
          standardCostTwo: this.netCostDefaultStandardCost.standardCostTwo
        });
      }
      const { standardCostTwo } = this.netCostForm.getRawValue();
      this.netCostForm.patchValue({
        standardCostTwo: standardCostTwo ? Number((standardCostTwo * discountedValue)).toFixed(3) : null
      });

    } else if (selectField == "standardCostThree") {

      if (distrDiscountCode == '0') {
        this.netCostForm.patchValue({
          standardCostThree: this.netCostDefaultStandardCost.standardCostThree
        });
      }
      const { standardCostThree } = this.netCostForm.getRawValue();
      this.netCostForm.patchValue({
        standardCostThree: standardCostThree ? Number((standardCostThree * discountedValue)).toFixed(3) : null
      });

    } else if (selectField == "standardCostFour") {

      if (distrDiscountCode == '0') {
        this.netCostForm.patchValue({
          standardCostFour: this.netCostDefaultStandardCost.standardCostFour
        });
      }
      const { standardCostFour } = this.netCostForm.getRawValue();
      this.netCostForm.patchValue({
        standardCostFour: standardCostFour ? Number((standardCostFour * discountedValue)).toFixed(3) : null
      });

    } else if (selectField == "standardCostFive") {

      if (distrDiscountCode == '0') {
        this.netCostForm.patchValue({
          standardCostFive: this.netCostDefaultStandardCost.standardCostFive
        });
      }
      const { standardCostFive } = this.netCostForm.getRawValue();
      this.netCostForm.patchValue({
        standardCostFive: standardCostFive ? Number((standardCostFive * discountedValue)).toFixed(3) : null
      });

    } else if (selectField == "standardCostSix") {

      if (distrDiscountCode == '0') {
        this.netCostForm.patchValue({
          standardCostSix: this.netCostDefaultStandardCost.standardCostSix
        });
      }
      const { standardCostSix } = this.netCostForm.getRawValue();
      this.netCostForm.patchValue({
        standardCostSix: standardCostSix ? (standardCostSix * discountedValue).toFixed(3) : null
      });

    };

  };

  /**
  * Show flash message
  */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
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
