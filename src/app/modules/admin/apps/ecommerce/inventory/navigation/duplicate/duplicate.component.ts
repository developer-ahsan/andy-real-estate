import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-duplicate',
  templateUrl: './duplicate.component.html'
})
export class DuplicateComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  flashMessage: 'success' | 'error' | null = null;
  firstFormGroup = this._formBuilder.group({
    number: ['', Validators.required],
    name: ['', Validators.required]
  });

  // boolean
  duplicateLoader = false;
  emptyValidationCheck = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getOrderHistoryByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((history) => {

        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  addDuplicate(): void {
    const formValues = this.firstFormGroup.getRawValue();
    const { pk_productID } = this.selectedProduct;

    if (!formValues.number || !formValues.name) {
      this.emptyValidationCheck = true;
      this.showFlashMessage('error');
      return;
    }

    const payload = {
      product_id: pk_productID,
      product_number: formValues.number,
      product_name: formValues.name,
      duplicate_product: true
    };
    this.duplicateLoader = true;
    this._inventoryService.addDuplicate(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.duplicateLoader = false;

        this.firstFormGroup.reset();
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
