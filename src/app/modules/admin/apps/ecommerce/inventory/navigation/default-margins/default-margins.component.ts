import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-default-margins',
  templateUrl: './default-margins.component.html'
})
export class DefaultMarginsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  defaultMargins = [];
  defaultMarginForm: FormGroup;
  defaultMarginUpdate = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    public _commonService: DashboardsService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.defaultMarginForm = this._formBuilder.group({
      1: [''],
      2: [''],
      3: [''],
      4: [''],
      5: [''],
      6: ['']
    });
    this.getProductDetail();
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getDefaultMargin();
      }
    });
  }
  getDefaultMargin() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getMarginsByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((margins) => {
        this.defaultMargins = margins["data"];
        const margin = {};
        if (margins["totalRecords"] !== 0) {
          for (let i = 0; i < this.defaultMargins.length; i++) {
            margin[i + 1] = this.defaultMargins[i].margin * 100
          }
        }
        this.defaultMarginForm.patchValue(margin);
        this.isLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isLoading = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  removeNull(array) {
    return array.filter(x => x !== null)
  };

  updateMargins(): void {
    const { pk_productID } = this.selectedProduct;
    const margins = [
      this.defaultMarginForm.getRawValue()["1"] || null,
      this.defaultMarginForm.getRawValue()["2"] || null,
      this.defaultMarginForm.getRawValue()["3"] || null,
      this.defaultMarginForm.getRawValue()["4"] || null,
      this.defaultMarginForm.getRawValue()["5"] || null,
      this.defaultMarginForm.getRawValue()["6"] || null,
    ];
    const realMargins = this.removeNull(margins);

    const hasInvalidValue = margins.some(value => value === null);
    if (hasInvalidValue) {
      this._commonService.snackBar('If you are supplying default margins for this product, please supply all six margins.');
      return;
    }

    // Check if there is any negative value
    const hasNegativeValue = margins.some(value => value !== null && value < 0);

    if (hasNegativeValue) {
      this._commonService.snackBar('An error occured trying to update the product default margins.');
      return;
    }
    const payload = {
      product_id: pk_productID,
      margins: realMargins,
      margin: true
    };

    this.defaultMarginUpdate = true;
    this._inventoryService.updateMargins(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.defaultMarginUpdate = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.defaultMarginUpdate = false;

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
