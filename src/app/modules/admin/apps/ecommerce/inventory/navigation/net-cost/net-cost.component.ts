import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NetCostUpdate } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';

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

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    const { pk_productID, msrp, liveCostComment, costComment, fk_coopID } = this.selectedProduct;

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
      internalComments: [''],
      redPriceComment: [''],
      coOp: [""]
    });
    // this.netCostForm.patchValue(customer);

    this._inventoryService.getDiscountCodes(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((discountCode) => {
        this.products = discountCode["data"];
        this._changeDetectorRef.markForCheck();
      })

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
          internalComments: costComment || "",
          redPriceComment: liveCostComment || "",
          coOp: fk_coopID || 0
        };
        this.netCostForm.patchValue(formValues);
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  updateNetCost(): void {
    const formValues = this.netCostForm.getRawValue();
    const payload = {
      product_id: parseInt(this.selectedProduct.pk_productID),
      quantity_list: `${formValues.quantityOne},${formValues.quantityTwo},${formValues.quantityThree},${formValues.quantityFour},${formValues.quantityFive},${formValues.quantitySix}`,
      cost_list: `${formValues.standardCostOne},${formValues.standardCostTwo},${formValues.standardCostThree},${formValues.standardCostFour},${formValues.standardCostFive},${formValues.standardCostSix}`,
      blank_cost_list: `${formValues.blankCostOne},${formValues.blankCostTwo},${formValues.blankCostThree},${formValues.blankCostFour},${formValues.blankCostFive},${formValues.blankCostSix}`,
      cost_comment: formValues.internalComments,
      live_cost_comment: formValues.redPriceComment,
      coop_id: parseInt(formValues.coOp),
      msrp: parseInt(formValues.msrp),
      net_cost: true
    }
    console.log("payload => ", payload)
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

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 1500);
  }
}
