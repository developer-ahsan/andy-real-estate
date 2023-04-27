import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { Package } from "app/modules/admin/apps/ecommerce/inventory/inventory.types";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { InventoryService } from "app/modules/admin/apps/ecommerce/inventory/inventory.service";
import { FormBuilder, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Component({
  selector: "app-delete-product",
  templateUrl: "./delete-product.component.html",
})
export class RemoveProductComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  flashMessage: "success" | "error" | null = null;
  firstFormGroup = this._formBuilder.group({
    number: ["", Validators.required],
    name: ["", Validators.required],
  });

  // boolean
  duplicateLoader = false;
  emptyValidationCheck = false;

  totalStores = 0;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.getProductDetail();
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getAllotedStores();
      }
    });
  }
  getAllotedStores() {
    let params = {
      store_version: true,
      product_id: this.selectedProduct.pk_productID
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.totalStores = res["totalRecords"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addDuplicate(): void {
    const formValues = this.firstFormGroup.getRawValue();
    const { pk_productID } = this.selectedProduct;

    if (!formValues.number || !formValues.name) {
      this.emptyValidationCheck = true;
      this.showFlashMessage("error");
      return;
    }

    const payload = {
      product_id: pk_productID,
      product_number: formValues.number,
      product_name: formValues.name,
      duplicate_product: true,
    };
    this.duplicateLoader = true;
    this._inventoryService.addDuplicate(payload).subscribe(
      (response) => {
        this._inventoryService
          .getProductByProductId(response["product_id"])
          .subscribe((res) => {
            this.showFlashMessage(
              response["success"] === true ? "success" : "error"
            );
            this.duplicateLoader = false;

            this.firstFormGroup.reset();
            const productId = response["product_id"];
            this._router.navigate([`/apps/ecommerce/inventory/${productId}`]);

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      },
      (err) => {
        this._snackBar.open("Some error occured", "", {
          horizontalPosition: "center",
          verticalPosition: "bottom",
          duration: 3500,
        });
        this.duplicateLoader = false;
        this.firstFormGroup.reset();
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  /**
   * Show flash message
   */
  showFlashMessage(type: "success" | "error"): void {
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

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}