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
        console.log("margin ", margin)
        this.defaultMarginForm.patchValue(margin);
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  updateMargins(): void {
    console.log("defaultMarginForm", this.defaultMarginForm.getRawValue());
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
