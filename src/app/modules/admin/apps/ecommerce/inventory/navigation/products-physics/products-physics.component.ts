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
      shippingUnit: [''],
      overPackingCharges: [''],
      flatRate: [''],
      caseHeight: [''],
      caseWidth: [''],
      caseLength: [''],
      caseQuantityOne: [''],
      caseQuantityTwo: [''],
      caseQuantityThree: [''],
      caseQuantityFour: [''],
      caseQuantityFive: [''],
      caseQuantitySix: ['']
    });

    const { pk_productID, weight, unitsInWeight, dimensions, unitsInShippingPackage, overPackCharge, flatRateShipping } = this.selectedProduct;
    this._inventoryService.getPhysicsAndDimension(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((caseDimensions) => {
        const caseDimension = caseDimensions["data"][0];
        const { caseLength, caseWidth, caseHeight } = caseDimension;

        const obj = {
          weight: weight,
          unitsInWeight: unitsInWeight,
          dimensions: dimensions,
          shippingUnit: unitsInShippingPackage,
          overPackingCharges: overPackCharge,
          flatRate: flatRateShipping,
          caseHeight: caseHeight,
          caseWidth: caseWidth,
          caseLength: caseLength,
          caseQuantityOne: null,
          caseQuantityTwo: null,
          caseQuantityThree: null,
          caseQuantityFour: null,
          caseQuantityFive: null,
          caseQuantitySix: null
        }

        console.log("obj => ", obj)
        // Fill the form
        // this.productPhysicsForm.patchValue(obj);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  updateDescription(): void {
    console.log("updateDescription");
  }

}
