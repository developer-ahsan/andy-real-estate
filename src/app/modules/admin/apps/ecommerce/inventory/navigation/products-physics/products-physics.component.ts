import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { ProductsDetails } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-products-physics',
  templateUrl: './products-physics.component.html'
})
export class ProductsPhysicsComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  productPhysics = [];
  productPhysicsForm: FormGroup;
  caseDimensionForm: FormGroup;
  flatRateShippingForm: FormGroup;

  selectedorder: string = 'select_order';
  products: string[] = [
    'YES',
    'NO'
  ];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    // Create the selected product shipping form
    this.productPhysicsForm = this._formBuilder.group({
      weight: [''],
      unitsInWeight: [''],
      dimensions: [''],
      unitsInShippingPackage: [''],
      overPackCharge: ['']
    });

    this.caseDimensionForm = this._formBuilder.group({
      caseHeight: [''],
      caseWidth: [''],
      caseLength: [''],
    });

    this.flatRateShippingForm = this._formBuilder.group({
      flatRateShipping: ['']
    });

    const { pk_productID, weight, unitsInWeight, dimensions, unitsInShippingPackage, overPackCharge, flatRateShipping } = this.selectedProduct;
    this._inventoryService.getPhysicsAndDimension(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((caseDimensions) => {

        // Fill dimesnion form
        this.caseDimensionForm.patchValue(caseDimensions["data"][0]);

        // Fill flat rate form
        this.flatRateShippingForm.patchValue(this.selectedProduct);

        // Fill the form
        this.productPhysicsForm.patchValue(this.selectedProduct);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  updateDescription(): void {
    console.log("updateDescription");
  }

}
