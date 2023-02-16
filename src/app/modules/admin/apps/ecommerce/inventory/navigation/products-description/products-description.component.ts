import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { InventoryService } from "app/modules/admin/apps/ecommerce/inventory/inventory.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import _ from "lodash";

@Component({
  selector: "app-products-description",
  templateUrl: "./products-description.component.html",
})
export class ProductsDescriptionComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean = true;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  supplierSelected = null;
  supplierDropdown = null;
  productDescription = [];
  suppliers = [];
  productDescriptionForm: FormGroup;
  selectedorder: string = "select_order";
  products: string[] = ["YES", "NO"];
  flashMessage: "success" | "error" | null = null;
  descriptionLoader = false;
  isSupplierNotReceived = true;
  isSupplierFetchingFailed = false;
  selectedSex = "N/A";
  isRefetchLoader: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.productDescriptionForm = this._formBuilder.group({
      fk_productID: [""],
      productName: [""],
      productNumber: [""],
      keywords: [""],
      internalKeywords: [""],
      metaDesc: [""],
      supplierLink: [""],
      sex: [""],
      searchKeywords: [""],
      productDesc: [""],
      ProductPermalink: [""],
      permalink: [""],
      optionsGuidelines: [""],
      notes: [""],
      miniDesc: [""],
      selectOrder: [""],
      purchaseOrderNotes: [""],
    });


    // Get the suppliers
    this._inventoryService.product$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((details) => {
        this.selectedProduct = details["data"][0];
        // Get the suppliers
        this._inventoryService.Suppliers$.pipe(
          takeUntil(this._unsubscribeAll)
        ).subscribe((supplier) => {
          const { fk_supplierID } = details["data"][0];
          this.suppliers = supplier["data"];
          this.supplierSelected = this.suppliers.find(
            (x) => x.pk_companyID == fk_supplierID
          );
          this.isSupplierNotReceived = false;
          this.getProductDescription();
          // Mark for check
          this._changeDetectorRef.markForCheck();
        });
      });


  }
  getProductDescription() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService
      .getProductDescription(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (description) => {
          if (description["data"]?.length) {
            this.productDescription = description["data"][0];
            this.productDescription = _.mapValues(
              this.productDescription,
              (v) => (v == "null" ? "" : v)
            );

            // Fill the form
            this.productDescriptionForm.patchValue(this.productDescription);
            this.productDescriptionForm.patchValue({
              internalKeywords:
                this.productDescription["ProductSearchKeywords"],
            });

            let sexVal = this.productDescription["sex"];
            if (sexVal == 0) {
              this.selectedSex = "N/A";
            } else if (sexVal == 1) {
              this.selectedSex = "Men's";
            } else if (sexVal == 2) {
              this.selectedSex = "Women's";
            } else if (sexVal == 3) {
              this.selectedSex = "Men's/Women's";
            } else if (sexVal == 4) {
              this.selectedSex = "Unisex";
            }

            this.isLoading = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          } else {
            this._snackBar.open(
              "No description details found for this product",
              "",
              {
                horizontalPosition: "center",
                verticalPosition: "bottom",
                duration: 3500,
              }
            );
            this.isLoading = false;

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }
        },
        (err) => {
          this._snackBar.open(
            "Some error occured while fetching description",
            "",
            {
              horizontalPosition: "center",
              verticalPosition: "bottom",
              duration: 3500,
            }
          );
          this.isLoadingChange.emit(false);

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }
      );
  }
  getAllSuppliers(supplierId) {
    this._inventoryService
      .getAllSuppliers()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (suppliers) => {
          this.suppliers = suppliers["data"];
          this.supplierSelected = this.suppliers.find(
            (x) => x.pk_companyID == supplierId
          );
          this.isSupplierNotReceived = false;

          // Mark for check
          this._changeDetectorRef.markForCheck();
        },
        (err) => {
          this.isSupplierFetchingFailed = true;
          this._snackBar.open(
            "Some error occured while fetching suppliers",
            "",
            {
              horizontalPosition: "center",
              verticalPosition: "bottom",
              duration: 3500,
            }
          );

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }
      );
  }

  getAllSuppliersRetry() {
    const { fk_supplierID } = this.selectedProduct;

    this.isRefetchLoader = true;
    // Get all suppliers
    this._inventoryService
      .getAllSuppliers()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (suppliers) => {
          this.suppliers = suppliers["data"];
          this.supplierSelected = this.suppliers.find(
            (x) => x.pk_companyID == fk_supplierID
          );
          this.isSupplierNotReceived = false;
          this.isRefetchLoader = false;
          this._snackBar.open("Suppliers fetched successfully", "", {
            horizontalPosition: "center",
            verticalPosition: "bottom",
            duration: 3500,
          });

          // Mark for check
          this._changeDetectorRef.markForCheck();
        },
        (err) => {
          this.isSupplierFetchingFailed = true;
          this.isRefetchLoader = false;
          this._snackBar.open(
            "Some error occured while fetching suppliers",
            "",
            {
              horizontalPosition: "center",
              verticalPosition: "bottom",
              duration: 3500,
            }
          );

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }
      );
  }

  selectBySupplier(event): void {
    this.supplierDropdown = event;
  }

  convertToSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }

  updateDescription(): void {
    const formValues = this.productDescriptionForm.getRawValue();
    let supplyId = null;
    const { pk_productID, fk_supplierID } = this.selectedProduct;

    if (!formValues.productName) {
      this._snackBar.open("Product Name is missing", "", {
        horizontalPosition: "center",
        verticalPosition: "bottom",
        duration: 3500,
      });
      return;
    }

    if (!formValues.productNumber) {
      this._snackBar.open("Product Number is missing", "", {
        horizontalPosition: "center",
        verticalPosition: "bottom",
        duration: 3500,
      });
      return;
    }

    if (this.supplierDropdown) {
      const { pk_companyID } = this.supplierDropdown;
      supplyId = pk_companyID;
    }

    let sexVal: number;
    if (this.selectedSex == "N/A") {
      sexVal = 1;
    } else if (this.selectedSex == "Men's") {
      sexVal = 2;
    } else if (this.selectedSex == "Women's") {
      sexVal = 3;
    } else if (this.selectedSex == "Men's/Women's") {
      sexVal = 4;
    } else if (this.selectedSex == "Unisex") {
      sexVal = 5;
    }

    const payload = {
      name: formValues.productName?.replace(/'/g, "''") || "",
      product_number: formValues.productNumber,
      product_desc: formValues.productDesc?.replace(/'/g, "''") || "",
      mini_desc: formValues.miniDesc?.replace(/'/g, "''") || "",
      keywords: formValues.keywords || "",
      notes: formValues.notes?.replace(/'/g, "''") || "",
      supplier_link: formValues.supplierLink || "",
      meta_desc: formValues.metaDesc?.replace(/'/g, "''") || "",
      sex: this.selectedProduct?.blnApparel ? sexVal : 0,
      search_keywords: formValues.internalKeywords || "",
      purchase_order_notes: formValues.purchaseOrderNotes?.replace(/'/g, "''") || "" || "",
      last_update_by: "" || "",
      last_update_date: "" || "",
      update_history: "" || "",
      product_id: pk_productID,
      supplier_id: supplyId || fk_supplierID,
      permalink: formValues.ProductPermalink,
      description: true,
    };

    this.descriptionLoader = true;
    this._inventoryService.updatePhysicsAndDescription(payload).subscribe(
      (response: any) => {
        this._inventoryService
          .getProductByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((product) => {
            this.showFlashMessage(
              response["success"] === true ? "success" : "error"
            );
            this.descriptionLoader = false;

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
        this.descriptionLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  copyMiniToMeta(): void {
    const formValues = this.productDescriptionForm.getRawValue();
    const { miniDesc } = formValues;
    if (miniDesc.length) {
      // Fill the form
      this.productDescriptionForm.patchValue({
        metaDesc: miniDesc,
      });
    }
  }

  copyMetaToInternal(): void {
    const formValues = this.productDescriptionForm.getRawValue();
    const { keywords } = formValues;
    if (keywords.length) {
      // Fill the form
      this.productDescriptionForm.patchValue({
        internalKeywords: keywords,
      });
    }
  }

  /**
   * Show flash message
   */
  showFlashMessage(type: "success" | "error"): void {
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

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
