import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-color-sizes',
  templateUrl: './color-sizes.component.html',
  styles: ['.table td, .table th {border-top: 0px} .input {width: 90px}']
})
export class ProductColorSizesComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isDisableProductLoader: boolean = false;
  isActivateProductLoader: boolean = false;
  reason: any = '';

  // Colors & Sizes
  colorsList: any;
  sizesList: any;
  mainScreen: string = 'Current Correction';
  colorUpdateLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getColorsSizes();
  }
  calledScreen(value) {
    this.mainScreen = value;
  }
  getColorsSizes() {
    let params = {
      color_size: true,
      product_id: this.selectedProduct.pk_productID
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.colorsList = res["color"];
      this.sizesList = res["size"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
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
