import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  validationCheckMessage = ""

  netCostFetchLoader = false;

  coOpProgramSettings: IDropdownSettings = {};
  selectedCoOpProgram = [];
  coops = [];
  selectedCooP = null;

  redPriceDropdownSettings: IDropdownSettings = {};
  selectedRedPriceItems = [];
  redPriceList = [
    { item_id: 1, item_text: 'Price does not include imprint. You may add desired imprint(s) during the checkout process for an additional cost' },
    { item_id: 2, item_text: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost' },
    { item_id: 3, item_text: 'Price includes a one color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 4, item_text: 'Price includes a laser engraved/one location imprint. Setups and any other additional fees may apply andwill be disclosed prior to checkout' },
    { item_id: 5, item_text: 'Price includes a laser etched/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 6, item_text: 'Price does not include imprint and is based on the white color option. You may add desired imprint(s) during the checkout process for an additional cost' },
    { item_id: 7, item_text: 'Price includes a full color/one location imprint. Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 8, item_text: 'Price includes imprint, setup, and run fees' },
    { item_id: 9, item_text: 'Setups and any other additional fees may apply and will be disclosed prior to checkout' },
    { item_id: 10, item_text: 'Item is sold blank' }
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

    this._inventoryService.getSystemDistributorCodes()
      .subscribe((response) => {
        this.distributionCodes = response["data"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    const { pk_productID, liveCostComment, fk_supplierID } = this.selectedProduct;

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

    // Get the CoOps
    this._inventoryService.getSpecificProductCoops(pk_productID)
      .subscribe((coops) => {
        this.coops = coops["data"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

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
      blankCostDropOne: [''],
      blankCostDropTwo: [''],
      blankCostDropThree: [''],
      blankCostDropFour: [''],
      blankCostDropFive: [''],
      blankCostDropSix: [''],
      msrp: [''],
      internalComments: ['']
    });
    // this.netCostForm.patchValue(customer);

    this._inventoryService.getCoOp(fk_supplierID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((coOp) => {
        this.products = coOp["data"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      })

    this._inventoryService.getProductByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((details) => {
        this.selectedProduct = details["data"][0];
        const { msrp, costComment } = this.selectedProduct

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
              standardCostDropOne: "",
              standardCostDropTwo: "",
              standardCostDropThree: "",
              standardCostDropFour: "",
              standardCostDropFive: "",
              standardCostDropSix: "",
              blankCostOne: netCost["data"][0]?.blankCost || "",
              blankCostTwo: netCost["data"][1]?.blankCost || "",
              blankCostThree: netCost["data"][2]?.blankCost || "",
              blankCostFour: netCost["data"][3]?.blankCost || "",
              blankCostFive: netCost["data"][4]?.blankCost || "",
              blankCostSix: netCost["data"][5]?.blankCost || "",
              blankCostDropOne: "",
              blankCostDropTwo: "",
              blankCostDropThree: "",
              blankCostDropFour: "",
              blankCostDropFive: "",
              blankCostDropSix: "",
              msrp: msrp || "",
              internalComments: costComment || ""
            };

            this.netCostForm.patchValue(formValues);

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
      })


  }

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
          if (productPricing["data"]["result"]["Envelope"]["Body"]["GetConfigurationAndPricingResponse"]["ErrorMessage"]["description"] != "Data not found") {
            const data = productPricing["data"]["result"]["Envelope"]["Body"]["GetConfigurationAndPricingResponse"]["Configuration"]["PartArray"];
            this._snackBar.open("Data fetched successfully", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.netCostFetchLoader = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
          } else {
            this._snackBar.open("No data found against this product number", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
          }

        }
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

  updateNetCost(): void {
    const formValues = this.netCostForm.getRawValue();
    const quantityListArray = [parseInt(formValues.quantityOne) || null, parseInt(formValues.quantityTwo) || null, parseInt(formValues.quantityThree) || null, parseInt(formValues.quantityFour) || null, parseInt(formValues.quantityFive) || null, parseInt(formValues.quantitySix) || null];
    const blankListArray = [parseInt(formValues.blankCostOne) || null, parseInt(formValues.blankCostTwo) || null, parseInt(formValues.blankCostThree) || null, parseInt(formValues.blankCostFour) || null, parseInt(formValues.blankCostFive) || null, parseInt(formValues.blankCostSix) || null];
    const standardCostList = [parseInt(formValues.standardCostOne) || null, parseInt(formValues.standardCostTwo) || null, parseInt(formValues.standardCostThree) || null, parseInt(formValues.standardCostFour) || null, parseInt(formValues.standardCostFive) || null, parseInt(formValues.standardCostSix) || null];
    const realQuantityList = this.removeNull(quantityListArray);
    const realBlankList = this.removeNull(blankListArray);
    const realStandardCostList = this.removeNull(standardCostList);

    // If length of quantities and blanks list is not equal then return
    if (realQuantityList?.length !== realBlankList?.length) {
      this.validationCheckMessage = "Number of quantity breaks does not match the number of blank cost amounts";
      this.showFlashMessage('error');
      return;
    }

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
