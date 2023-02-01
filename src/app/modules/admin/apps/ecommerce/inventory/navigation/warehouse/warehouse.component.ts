import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html'
})
export class WarehouseComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  videosLength: number = 0;
  wareHouseLength: number = 0;
  wareHouseForm: FormGroup;
  images: FileList = null;
  imageRequired: string = '';
  wareHouseLoader = false;

  inventoryCheck = "";
  thresholdCheck = "";
  quantityCheck = "";
  feeCheck = "";
  isValidated = true;

  selected: string = 'No';
  seasons: string[] = ['Yes', 'No'];
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.wareHouseForm = this._formBuilder.group({
      inventory: ['', Validators.required],
      inventoryThreshold: ['', Validators.required],
      warehousingCost: ['', Validators.required],
      handlingCost: ['', Validators.required],
      maxQuantity: [''],
      warehouseCode: [''],
      deliveryFee: [''],
      deliveryNote: [''],
      checkBox1: ['UPS Ground'],
      checkBox2: ['Expedited UPS'],
      checkBox3: ['Pick-Up'],
      checkBox4: ['Delivery']
    });
    this.getProductDetail();

  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        const { pk_productID } = this.selectedProduct;

        this._inventoryService.getWarehouseByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((warehouse) => {
            this.wareHouseLength = warehouse["totalRecords"];
            if (this.wareHouseLength > 0) {
              this.selected = 'Yes';
            }
            this.wareHouseForm.patchValue(warehouse["data"][0]);
            this.isLoadingChange.emit(false);

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured fetchinf warehouse data", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.isLoadingChange.emit(false);

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      }
    });
  }
  radioChange(event) {
  }

  isNumeric(num) {
    return !isNaN(num)
  };

  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
  }

  uploadImage(): void {
    if (!this.images) {
      this.imageRequired = "*Please attach an image and continue"
      return;
    }
    this.imageRequired = '';
  };

  wareHouseSubmitCall(): void {
    const { pk_productID } = this.selectedProduct;
    const formValues = this.wareHouseForm.getRawValue();
    const payload = {
      inventory: parseInt(formValues.inventory) || 0,
      inventory_threshold: parseInt(formValues.inventoryThreshold) || 0,
      warehousing_cost: parseInt(formValues.warehousingCost) || 0,
      handling_cost: parseInt(formValues.handlingCost) || 0,
      delivery_options: formValues.checkBox1 || "",
      delivery_fees: parseInt(formValues.deliveryFee) || 0,
      delivery_note: formValues.deliveryNote || "",
      max_quantity: parseInt(formValues.maxQuantity) || 0,
      ware_house_code: (formValues.warehouseCode),
      product_id: parseInt(pk_productID),
      call_type: this.wareHouseLength > 0 ? "put" : "post",
      warehouse: true
    };

    this.wareHouseLoader = true;
    this._inventoryService.updateWarehouse(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.wareHouseLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.wareHouseLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

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


