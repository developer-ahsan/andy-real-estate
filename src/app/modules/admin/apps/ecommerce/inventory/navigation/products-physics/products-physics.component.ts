import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
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
  caseQuantitiesForm: FormGroup;
  flatRateLoader = false;
  physicsLoader = false;
  caseQTYLoader = false;
  caseDimensionLoader = false;
  flashMessage: 'success' | 'error' | null = null;

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
    const { pk_productID } = this.selectedProduct;

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
      caseLength: ['']
    });

    this.flatRateShippingForm = this._formBuilder.group({
      flatRateShipping: ['']
    });

    this.caseQuantitiesForm = this._formBuilder.group({
      quantityOne: [''],
      quantityTwo: [''],
      quantityThree: [''],
      quantityFour: [''],
      quantityFive: [''],
      quantitySix: ['']
    });

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
    this._inventoryService.getCaseQuantities(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((caseQuantity) => {
        const formValue = {
          quantityOne: caseQuantity["data"][0].quantity,
          quantityTwo: caseQuantity["data"][1].quantity,
          quantityThree: caseQuantity["data"][2].quantity,
          quantityFour: caseQuantity["data"][3].quantity,
          quantityFive: caseQuantity["data"][4].quantity,
          quantitySix: caseQuantity["data"][5].quantity
        };
        this.caseQuantitiesForm.patchValue(formValue);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  updateFlatRateShipping(): void {
    const payload = {
      product_id: this.selectedProduct.pk_productID,
      flat_rate_shipping: this.flatRateShippingForm.getRawValue().flatRateShipping,
      flat_rate: true
    }
    this.flatRateLoader = true;
    this._inventoryService.updateFlatRateShipping(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.flatRateLoader = false;
      });
  }

  updatePhysics(): void {
    const payload = {
      product_id: this.selectedProduct.pk_productID,
      weight: this.productPhysicsForm.getRawValue().weight,
      weight_in_units: this.productPhysicsForm.getRawValue().unitsInWeight,
      dimensions: this.productPhysicsForm.getRawValue().dimensions,
      over_pack_charge: this.productPhysicsForm.getRawValue().unitsInShippingPackage,
      physics: true
    }
    this.physicsLoader = true;
    this._inventoryService.updatePhysics(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.physicsLoader = false;
      });
  }

  updateCaseDimension(): void {
    const payload = {
      product_id: this.selectedProduct.pk_productID,
      case_height: parseInt(this.caseDimensionForm.getRawValue().caseHeight),
      case_width: parseInt(this.caseDimensionForm.getRawValue().caseWidth),
      case_length: parseInt(this.caseDimensionForm.getRawValue().caseLength),
      case_dimension: true
    };
    this.caseDimensionLoader = true;
    this._inventoryService.updateCaseDimensions(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.caseDimensionLoader = false;
      });
  }

  updateCaseQuantities(): void {
    const {
      quantityOne,
      quantityTwo,
      quantityThree,
      quantityFour,
      quantityFive,
      quantitySix
    } = this.caseQuantitiesForm.getRawValue();

    const payload = {
      product_id: this.selectedProduct.pk_productID,
      case_quantities: `${quantityOne},${quantityTwo},${quantityThree},${quantityFour},${quantityFive},${quantitySix}`,
      case_quantity: true
    }
    this.caseQTYLoader = true;
    this._inventoryService.updateCaseQuantity(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.caseQTYLoader = false;
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

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 1500);
  }
}
