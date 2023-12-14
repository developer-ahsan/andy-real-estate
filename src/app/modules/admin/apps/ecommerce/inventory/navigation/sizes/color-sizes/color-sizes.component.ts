import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { UpdatePriceCorrection } from '../../../inventory.types';

@Component({
  selector: 'app-color-sizes',
  templateUrl: './color-sizes.component.html',
  styles: ['.table td, .table th {border-top: 0px} .input {width: 90px}']
})
export class ProductColorSizesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isDisableProductLoader: boolean = false;
  isActivateProductLoader: boolean = false;
  reason: any = '';

  // Colors & Sizes
  colorsList: any;
  sizesList: any;
  correctionsList: any;
  correctionsSumList: any;
  finalCostList: any;
  newCorrectionsList: any;
  auxiliaryList: any;

  mainScreen: string = 'New Correction';
  colorUpdateLoader: boolean = false;

  productCost: any;
  sizeUpdateLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getProductDetail();
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.productCost = details["productCost"][0].cost;
        this.getColorsSizes('get');
      }
    });
  }
  calledScreen(value) {
    this.mainScreen = value;
  }
  getColorsSizes(type) {
    let params = {
      color_size: true,
      product_id: this.selectedProduct.pk_productID
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.colorsList = res["color"];
      this.sizesList = res["size"];
      this.auxiliaryList = [];
      for (let i = 0; i < this.sizesList.length; i++) {
        this.auxiliaryList[i] = { value: 0 };
      }
      let corrections = res["correctiom"];
      const result = corrections.reduce((acc, curr) => {
        const index = this.colorsList.findIndex(color => color.fk_colorID == curr.fk_colorID);
        const { colorName, fk_colorID, ...rest } = curr;
        const color = acc[fk_colorID] || { fk_colorID, colorName, items: [] };
        color.items.push(rest);
        acc[fk_colorID] = color;
        return acc;
      }, {});
      this.correctionsList = Object.values(result).sort((a: any, b: any) => a.colorName.localeCompare(b.colorName));
      const result1 = corrections.reduce((acc, curr) => {
        const index = this.colorsList.findIndex(color => color.fk_colorID == curr.fk_colorID);
        const { colorName, fk_colorID, ...rest } = curr;
        const color = acc[fk_colorID] || { fk_colorID, colorName, items: [] };
        color.items.push(rest);
        acc[fk_colorID] = color;
        return acc;
      }, {});
      this.correctionsSumList = Object.values(result1).sort((a: any, b: any) => a.colorName.localeCompare(b.colorName));
      this.correctionsSumList.forEach(element => {
        this.colorsList.forEach(color => {
          if (element.fk_colorID == color.fk_colorID) {
            element.items.forEach(size => {
              size.amount += color.run;
            });
          }
        });
      });

      this.correctionsSumList.forEach(element => {
        this.sizesList.forEach(size => {
          element.items.forEach(item => {
            if (item.fk_sizeID == size.fk_sizeID) {
              item.amount += size.run;
            }
          });
        });
      });

      console.log(this.correctionsSumList);
      console.log(this.sizesList);
      const newFinalCostList = JSON.parse(JSON.stringify(this.correctionsSumList));
      newFinalCostList.forEach(element => {
        element.items.forEach(size => {
          size.amount += this.productCost;
        });
      });
      this.finalCostList = newFinalCostList;
      // New Corrections List
      const result2 = corrections.reduce((acc, curr) => {
        const index = this.colorsList.findIndex(color => color.fk_colorID == curr.fk_colorID);
        const { colorName, fk_colorID, ...rest } = curr;
        const color = acc[fk_colorID] || { fk_colorID, colorName, items: [] };
        color.items.push(rest);
        acc[fk_colorID] = color;
        return acc;
      }, {});
      this.newCorrectionsList = Object.values(result2).sort((a: any, b: any) => a.colorName.localeCompare(b.colorName));
      if (type == 'update') {
        this._snackBar.open('Options pricing correction was updated successfully', '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.sizeUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  clearAll() {
    this.newCorrectionsList.forEach(element => {
      element.items.forEach(size => {
        size.amount = null;
      });
    });
    for (let i = 0; i < this.sizesList.length; i++) {
      this.auxiliaryList[i] = { value: 0 };
    }
  }
  addCorrectionValues(correction) {
    correction.forEach((element, index) => {
      element.amount = this.auxiliaryList[index].value;
    });
  }
  updateCorrectionValues() {
    let ColorSize = [];
    for (let i = 0; i < this.newCorrectionsList.length; i++) {
      for (let j = 0; j < this.newCorrectionsList[i].items.length; j++) {
        let arr_Value: any = { size_id: null, color_id: null, amount: null };
        if (this.newCorrectionsList[i].items[j].amount == null) {
          arr_Value.amount = 0;
        } else {
          arr_Value.amount = this.newCorrectionsList[i].items[j].amount;
        }
        arr_Value.size_id = this.newCorrectionsList[i].items[j].fk_sizeID;
        arr_Value.color_id = this.newCorrectionsList[i].fk_colorID;
        ColorSize.push(arr_Value);
      }
    }
    let payload: UpdatePriceCorrection = {
      product_id: this.selectedProduct.pk_productID,
      color_sizes: ColorSize,
      update_price_correction: true
    }
    this.sizeUpdateLoader = true;
    this._inventoryService.updateProductsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getColorsSizes('update')
      } else {
        this.sizeUpdateLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._snackBar.open('Something went wrong please try again', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.sizeUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
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
