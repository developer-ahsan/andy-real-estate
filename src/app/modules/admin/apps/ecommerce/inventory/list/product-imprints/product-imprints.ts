import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-product-imprints',
  templateUrl: './product-imprints.html',
})
export class ProductImprintsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() myStepper: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  standardImprintLoader = false;
  standardImprints = [];
  isSelectAll = false;
  isSubValuesSelectAll = false;
  standardImprintAddLoader = false;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    if (!this._inventoryService.standardImprints) {
      this.getStandardImprints();
    }
  };

  getStandardImprints(): void {
    this.standardImprintLoader = true;
    this._inventoryService.getStandardImprints()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((standard_groups) => {
        this._inventoryService.getSubStandardImprints()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((standard_sub_imprints) => {
            const standardgroupArray = standard_groups["data"];
            const standardSubGroupArray = standard_sub_imprints["data"];

            var groupedStandard = standardSubGroupArray.reduce(function (results, org) {
              (results[org.fk_standardImprintGroupID] = results[org.fk_standardImprintGroupID] || []).push(org);
              return results;
            }, {});

            let tempArray = [];
            for (let i = 0; i < standardgroupArray.length; i++) {
              let pk_standardImprintGroupID = standardgroupArray[i].pk_standardImprintGroupID;
              let obj = {
                standard_imprints: standardgroupArray[i],
                sub_standard_imprints: groupedStandard[`${pk_standardImprintGroupID}`]
              };
              tempArray.push(obj);
            };

            this.standardImprints = tempArray;
            for (let subImprints of this.standardImprints) {
              let { sub_standard_imprints } = subImprints;
              if (!sub_standard_imprints) {
                sub_standard_imprints = [];
              };

              if (sub_standard_imprints.length) {
                for (const sub_standard of sub_standard_imprints) {
                  sub_standard["isChecked"] = false;
                };
              }
            };
            this._inventoryService.standardImprints = this.standardImprints;
            this.standardImprintLoader = false;

            // Mark for Check
            this._changeDetectorRef.markForCheck();
          });
      });
  };
  clearAllStandardImprintOptions(): void {
    this.isSelectAll = !this.isSelectAll;
    for (let subImprints of this._inventoryService.standardImprints) {
      const { standard_imprints, sub_standard_imprints } = subImprints;
      standard_imprints["isChecked"] = false;
      for (const sub_standard of sub_standard_imprints) {
        sub_standard["isChecked"] = this.isSelectAll ? true : false;
      };
    }
  };
  selectCheckedOption(data): void {
    this.isSubValuesSelectAll = !this.isSubValuesSelectAll;
    const { sub_standard_imprints } = data;
    for (const sub_standard of sub_standard_imprints) {
      sub_standard["isChecked"] = this.isSubValuesSelectAll ? true : false;
    };
  };
  public saveStandardImprints(): void {
    let count = 0;
    let imprintsToUpdate = [];
    for (const standardImprint of this._inventoryService.standardImprints) {
      const { sub_standard_imprints } = standardImprint;
      for (const sub_standard_imprint of sub_standard_imprints) {
        if (sub_standard_imprint.isChecked) {
          imprintsToUpdate.push(sub_standard_imprint);
        }
      }
      count = count + sub_standard_imprints.filter(function (s) { return s.isChecked }).length;
    };

    if (!count) {

      // return;
    } else {
      this.standardImprintAddLoader = true;
      this._changeDetectorRef.markForCheck();
      const { pk_productID } = this.selectedProduct;
      const finalImprintPayload = [];
      for (const imprint of imprintsToUpdate) {
        const {
          fk_decoratorID,
          fk_methodID,
          fk_locationID,
          fk_setupChargeID,
          fk_runChargeID,
          blnIncludable,
          area,
          blnUserColorSelection,
          maxColors,
          fk_multiColorMinQID,
          fk_collectionID,
          blnSingleProcess,
          blnColorProcess,
          blnStitchProcess,
          minProductQty,
          imprintComments,
          fk_digitizerID,
          blnActive,
          blnSingleton,
          pk_standardImprintID,
          displayOrder
        } = imprint;
        let processMode;
        if (blnColorProcess) {
          processMode = 0;
        } else if (blnStitchProcess) {
          processMode = 1;
        } else if (blnSingleProcess) {
          processMode = 2;
        };
        const imprintObj = {
          product_id: pk_productID,
          decorator_id: fk_decoratorID,
          method_id: fk_methodID,
          location_id: fk_locationID,
          setup_charge_id: fk_setupChargeID,
          run_charge_id: fk_runChargeID,
          bln_includable: blnIncludable,
          area: area,
          bln_user_color_selection: blnUserColorSelection,
          max_colors: maxColors,
          multi_color_min_id: fk_multiColorMinQID,
          collection_id: fk_collectionID,
          bln_process_mode: processMode,
          min_product_qty: minProductQty,
          imprint_comments: imprintComments,
          digitizer_id: fk_digitizerID,
          bln_active: blnActive,
          bln_singleton: blnSingleton,
          bln_color_selection: blnUserColorSelection,
          imprint_id: pk_standardImprintID,
          store_product_id_list: [],
          display_order: displayOrder
        };
        finalImprintPayload.push(imprintObj);
      }

      const payload = {
        standard_imprint: true,
        imprint_obj: finalImprintPayload
      };

      this._inventoryService.addStandardImprints(payload)
        .subscribe((response) => {
          this.standardImprintAddLoader = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    }

  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
