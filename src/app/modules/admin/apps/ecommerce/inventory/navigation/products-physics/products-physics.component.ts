import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Options } from '@angular-slider/ngx-slider';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  caseQtyTabLoader = false;
  flashMessage: 'success' | 'error' | 'errorMessage' | null = null;

  isPhysicsUpdate = false;
  isFlatUpdate = false;
  isDimensionsUpdate = false;
  isQuantityUpdate = false;

  physicsValidationMessage = '';

  fob = [];

  selectedorder: string = 'select_order';
  bln_include_shipping: string[] = [
    'YES',
    'NO'
  ];
  blnShipingValue: string = "";
  // Slider
  sliderMinValue: number = 10;
  sliderMaxValue: number = 50;
  sliderOptions: Options = {
    floor: 1,
    ceil: 120
  };

  shipsFromCheck = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    // Create the selected product shipping form
    this.productPhysicsForm = this._formBuilder.group({
      weight: ['', Validators.required],
      unitsInWeight: ['', Validators.required],
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

    this._inventoryService.getProductByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((productDetails) => {
        this.selectedProduct = productDetails["data"][0];
        const { blnIncludeShipping, prodTimeMax, prodTimeMin, weight, unitsInWeight, dimensions, unitsInShippingPackage, overPackCharge } = this.selectedProduct;
        this.sliderMaxValue = prodTimeMax;
        this.sliderMinValue = prodTimeMin;
        this.blnShipingValue = blnIncludeShipping ? 'YES' : 'NO';

        const physics = {
          weight: Number(weight).toFixed(2),
          unitsInWeight: unitsInWeight,
          dimensions: dimensions,
          unitsInShippingPackage: unitsInShippingPackage,
          overPackCharge: Number(overPackCharge).toFixed(4)
        };

        // Fill the form
        this.productPhysicsForm.patchValue(physics);
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getPhysicsAndDimension(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((caseDimensions) => {

        // Fill dimesnion form
        this.caseDimensionForm.patchValue(caseDimensions["data"][0]);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {

        // Fill dimesnion form
        this.caseDimensionForm.patchValue(null);
        this._snackBar.open("Some error occured while fetching dimensions", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  showOptions(event): void {
    this.shipsFromCheck = event.checked;
  }

  updateFlatRateShipping(): void {
    this.isPhysicsUpdate = false;
    this.isFlatUpdate = true;
    this.isDimensionsUpdate = false;
    this.isQuantityUpdate = false;

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
  };

  myTabSelectedIndexChange(index: number) {
    if (index === 1) {
      const { flatRateShipping } = this.selectedProduct;
      const flatRateObj = {
        flatRateShipping: Number(flatRateShipping).toFixed(2)
      };

      // Fill flat rate form
      this.flatRateShippingForm.patchValue(flatRateObj);
    }
    if (index === 3) {
      this.caseQtyTabLoader = true;
      const { pk_productID } = this.selectedProduct;
      this._inventoryService.getCaseQuantities(pk_productID)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((caseQuantity) => {
          if (caseQuantity["data"]?.length) {
            const formValue = {
              quantityOne: caseQuantity["data"][0]?.quantity,
              quantityTwo: caseQuantity["data"][1]?.quantity,
              quantityThree: caseQuantity["data"][2]?.quantity,
              quantityFour: caseQuantity["data"][3]?.quantity,
              quantityFive: caseQuantity["data"][4]?.quantity,
              quantitySix: caseQuantity["data"][5]?.quantity
            };
            this.caseQuantitiesForm.patchValue(formValue);
          };

          this.caseQtyTabLoader = false;
          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this._snackBar.open("Some error occured while fetching case quantites", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.caseQtyTabLoader = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  onShippingChargesChange(event) {
    const { value } = event;
    this.blnShipingValue = value;
  };

  updatePhysics(): void {
    this.isPhysicsUpdate = true;
    this.isFlatUpdate = false;
    this.isDimensionsUpdate = false;
    this.isQuantityUpdate = false;

    const { blnApparel, pk_productID } = this.selectedProduct;

    const payload = {
      product_id: pk_productID,
      weight: this.productPhysicsForm.getRawValue().weight || null,
      weight_in_units: this.productPhysicsForm.getRawValue().unitsInWeight || null,
      dimensions: this.productPhysicsForm.getRawValue().dimensions || null,
      over_pack_charge: this.productPhysicsForm.getRawValue().overPackCharge,
      bln_apparel: blnApparel,
      shipping: {
        prod_time_min: this.sliderMinValue,
        prod_time_max: this.sliderMaxValue,
        units_in_shipping_package: this.productPhysicsForm.getRawValue().unitsInShippingPackage,
        bln_include_shipping: this.blnShipingValue === 'YES' ? 1 : 0,
        fob_location_list: this.fob?.length
          ? this.fob.map(({ fk_FOBLocationID }) => fk_FOBLocationID)
          : []
      },
      physics: true
    };

    if (!blnApparel) {
      if (payload.weight < 1 || !payload.weight) {
        this.physicsValidationMessage = "Please enter weight with non-zero positive number"
        this.showFlashMessage('errorMessage');
        return;
      };

      if (payload.weight_in_units < 1 || !payload.weight_in_units) {
        this.physicsValidationMessage = "Please enter non-zero positive weights in units"
        this.showFlashMessage('errorMessage');
        return;
      };

      if (!this.shipsFromCheck) {
        this.physicsValidationMessage = "At least one shipment F.O.B. location is required"
        this.showFlashMessage('errorMessage');
        return;
      };
    };

    this.physicsLoader = true;
    this._inventoryService.updatePhysics(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.physicsLoader = false;
      }, err => {
        this._snackBar.open("Some error occured while updating physics", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.physicsLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  updateCaseDimension(): void {
    this.isPhysicsUpdate = false;
    this.isFlatUpdate = false;
    this.isDimensionsUpdate = true;
    this.isQuantityUpdate = false;

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

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured while updating case dimensions", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.caseDimensionLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  updateCaseQuantities(): void {
    this.isPhysicsUpdate = false;
    this.isFlatUpdate = false;
    this.isDimensionsUpdate = false;
    this.isQuantityUpdate = true;

    const {
      quantityOne,
      quantityTwo,
      quantityThree,
      quantityFour,
      quantityFive,
      quantitySix
    } = this.caseQuantitiesForm.getRawValue();

    let quantitiesArray = [
      quantityOne,
      quantityTwo,
      quantityThree,
      quantityFour,
      quantityFive,
      quantitySix
    ];

    quantitiesArray = quantitiesArray.filter(Number);

    const payload = {
      product_id: this.selectedProduct.pk_productID,
      case_quantities: quantitiesArray,
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
      }, err => {
        this._snackBar.open("Some error occured while updating case quantities", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.caseQTYLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
 * Show flash message
 */
  showFlashMessage(type: 'success' | 'error' | 'errorMessage'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }
}
