import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-special-description',
  templateUrl: './special-description.component.html'
})
export class SpecialDescComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isUpdateLoading: boolean = false;
  description: string = '';
  miniDescription: string = '';
  metaDescription: string = '';


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.isLoading = true;
    this.getDescription();
  }
  getDescription() {
    this._inventoryService
      .getProductDescription(this.selectedProduct.fk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((description) => {
        this.description = description["data"][0].productDesc;
        this.miniDescription = description["data"][0].miniDesc;
        this.metaDescription = description["data"][0].metaDesc;
        this.isLoadingChange.emit(false);
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isLoadingChange.emit(false);
        this.isLoading = false;
        this._changeDetectorRef.markForCheck();
      });
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
