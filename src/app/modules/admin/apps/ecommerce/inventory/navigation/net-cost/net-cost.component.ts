import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
export class NetCostComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
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

  redPriceDropdownSettings: IDropdownSettings = {};
  selectedRedPriceItems = [];
  selectedRedPrice: string;
  redPriceList = [
    'Price does not include imprint. You may add desired imprint(s) during the checkout process for an additional cost',
    'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost',
    'Price includes a one color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout',
    'Price includes a laser engraved/one location imprint. Setups and any other additional fees may apply andwill be disclosed prior to checkout',
    'Price includes a laser etched/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout',
    'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost',
    'Price includes a full color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout',
    'Price includes imprint, setup, and run fees',
    'Setups and any other additional fees may apply and will be disclosed prior to checkout',
    'Item is sold blank'
  ];
  redPriceCommentText = "";

  distributionCodes = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
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

    const { pk_productID, liveCostComment } = this.selectedProduct;

    this.selectedRedPriceItems.push(liveCostComment)

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

    this.getCoOps();

    this._inventoryService.getSystemDistributorCodes()
      .subscribe((response) => {
        this.distributionCodes = response["data"];
        this.distributionCodes.push({
          distrDiscount: -1,
          distrDiscountCode: "COST"
        });
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

    this._inventoryService.product$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((details) => {
        this.selectedProduct = details["data"][0];
        const { msrp, costComment, liveCostComment } = this.selectedProduct;
        if (liveCostComment) {
          this.redPriceList.push(liveCostComment);
          this.selectedRedPrice = liveCostComment;
        };

        this._inventoryService.getNetCost(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((netCost) => {
            const formValues = {
              quantityOne: netCost["data"][0]?.quantity || "",
              quantityTwo: netCost["data"][1]?.quantity || "",
              quantityThree: netCost["data"][2]?.quantity || "",
              quantityFour: netCost["data"][3]?.quantity || "",
              quantityFive: netCost["data"][4]?.quantity || "",
              quantitySix: netCost["data"][5]?.quantity || "",
              standardCostOne: netCost["data"][0]?.cost || "",
              standardCostTwo: netCost["data"][1]?.cost || "",
              standardCostThree: netCost["data"][2]?.cost || "",
              standardCostFour: netCost["data"][3]?.cost || "",
              standardCostFive: netCost["data"][4]?.cost || "",
              standardCostSix: netCost["data"][5]?.cost || "",
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
            this.isLoadingChange.emit(false);

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            // Main component loader setting to false
            this.isLoadingChange.emit(false);
            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        // Main component loader setting to false
        this.isLoadingChange.emit(false);
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
    const sample = {
      standardCostOne: "",
      standardCostTwo: "",
      standardCostThree: "",
      standardCostFour: "",
      standardCostFive: "",
      standardCostSix: ""
    };
    this.netCostForm.patchValue(sample);
  };

  setDropdownValue(value: string) {
    this.selectedDropdown = this.distributionCodes.find(item => item.distrDiscountCode === value);
    const sample = {
      standardCostDropOne: this.selectedDropdown,
      standardCostDropTwo: this.selectedDropdown,
      standardCostDropThree: this.selectedDropdown,
      standardCostDropFour: this.selectedDropdown,
      standardCostDropFive: this.selectedDropdown,
      standardCostDropSix: this.selectedDropdown
    };
    this.netCostForm.patchValue(sample);
  };

  onCoOpProgramSelect(item: any) {
    const { pk_coopID } = item;
    this.selectedCooP = pk_coopID;
  };

  fetchNetCost(): void {
    const { productNumber } = this.selectedProduct;
    this.netCostFetchLoader = true;
    this._inventoryService.getPromoStandardProductPricingDetails(productNumber)
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
                  }

                  if (i == 5) {
                    obj["standardCostSix"] = price
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
                  const { minQuantity, price } = pricingDataArray[i]["PartPriceArray"][0];
                  if (i == 0) {
                    obj["quantityOne"] = minQuantity;
                    obj["standardCostOne"] = price;
                  }

                  if (i == 1) {
                    obj["quantityTwo"] = minQuantity;
                    obj["standardCostTwo"] = price;
                  }

                  if (i == 2) {
                    obj["quantityThree"] = minQuantity;
                    obj["standardCostThree"] = price;
                  }

                  if (i == 3) {
                    obj["quantityFour"] = minQuantity;
                    obj["standardCostFour"] = price;
                  }

                  if (i == 4) {
                    obj["quantityFive"] = minQuantity;
                    obj["standardCostFive"] = price;
                  }

                  if (i == 5) {
                    obj["quantitySix"] = minQuantity;
                    obj["standardCostSix"] = price;
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

  onRedPriceItemSelect(text: string) {
    this.redPriceCommentText = text;
  };

  removeNull(array) {
    return array.filter(x => x !== null)
  };

  updateNetCost(): void {
    const formValues = this.netCostForm.getRawValue();
    const quantityListArray = [parseInt(formValues.quantityOne) || null, parseInt(formValues.quantityTwo) || null, parseInt(formValues.quantityThree) || null, parseInt(formValues.quantityFour) || null, parseInt(formValues.quantityFive) || null, parseInt(formValues.quantitySix) || null];
    const blankListArray = [parseInt(formValues.blankCostOne) || null, parseInt(formValues.blankCostTwo) || null, parseInt(formValues.blankCostThree) || null, parseInt(formValues.blankCostFour) || null, parseInt(formValues.blankCostFive) || null, parseInt(formValues.blankCostSix) || null];
    const standardCostList = [parseInt(formValues.standardCostOne) || null, parseInt(formValues.standardCostTwo) || null, parseInt(formValues.standardCostThree) || null, parseInt(formValues.standardCostFour) || null, parseInt(formValues.standardCostFive) || null, parseInt(formValues.standardCostSix) || null];
    const realQuantityList = this.removeNull(quantityListArray);
    const realBlankList = this.removeNull(blankListArray);
    const realStandardCostList = this.removeNull(standardCostList);

    // If length of quantities and blanks list is not equal then return
    // if (realQuantityList?.length !== realBlankList?.length) {
    //   this.validationCheckMessage = "Number of quantity breaks does not match the number of blank cost amounts";
    //   this.showFlashMessage('error');
    //   return;
    // }

    const payload = {
      product_id: parseInt(this.selectedProduct.pk_productID),
      quantity_list: realQuantityList,
      cost_list: realStandardCostList,
      blank_cost_list: realBlankList,
      cost_comment: formValues.internalComments,
      live_cost_comment: this.redPriceCommentText || "",
      coop_id: this.selectedCooP || 0,
      msrp: parseInt(formValues.msrp),
      net_cost: true
    };

    this.netCostLoader = true;
    this._inventoryService.updateNetCost(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.netCostLoader = false;
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
  }

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
  }
}
