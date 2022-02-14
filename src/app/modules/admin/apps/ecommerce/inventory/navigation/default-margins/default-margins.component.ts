import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-default-margins',
  templateUrl: './default-margins.component.html'
})
export class DefaultMarginsComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  defaultMargins = [];
  defaultMarginForm: FormGroup;
  defaultMarginUpdate = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
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

    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getMarginsByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((margins) => {
        this.defaultMargins = margins["data"];
        const margin = {};
        if (margins["totalRecords"] !== 0) {
          for (let i = 0; i < this.defaultMargins.length; i++) {
            margin[i + 1] = this.defaultMargins[i].margin
          }
        }
        this.defaultMarginForm.patchValue(margin);
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
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
    const payload = {
      product_id: pk_productID,
      margins: realMargins,
      margin: true
    }
    console.log("payload", payload);
    this.defaultMarginUpdate = true;
    this._inventoryService.updateMargins(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.defaultMarginUpdate = false;
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
