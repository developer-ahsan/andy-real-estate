import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'lodash';

@Component({
  selector: 'app-products-description',
  templateUrl: './products-description.component.html'
})
export class ProductsDescriptionComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  supplierSelected = null;
  supplierDropdown = null;
  productDescription = [];
  suppliers = [];
  productDescriptionForm: FormGroup;
  selectedorder: string = 'select_order';
  products: string[] = [
    'YES',
    'NO'
  ];
  flashMessage: 'success' | 'error' | null = null;
  descriptionLoader = false;
  isSupplierNotReceived = true;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    // Create the selected product form
    this.productDescriptionForm = this._formBuilder.group({
      fk_productID: [''],
      productName: [''],
      productNumber: [''],
      keywords: [''],
      internalKeywords: [''],
      metaDesc: [''],
      supplierLink: [''],
      sex: [''],
      searchKeywords: [''],
      productDesc: [''],
      ProductPermalink: [''],
      permalink: [''],
      optionsGuidelines: [''],
      notes: [''],
      miniDesc: [''],
      technoLogoSKU: [''],
      selectOrder: [''],
      purchaseOrderNotes: ['']
    });

    const { pk_productID } = this.selectedProduct;

    // Get the suppliers
    this._inventoryService.getProductByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((details) => {
        this._inventoryService.getAllSuppliers()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((supplier) => {
            const { fk_supplierID } = details["data"][0];
            this.suppliers = supplier["data"];
            this.supplierSelected = this.suppliers.find(x => x.pk_companyID == fk_supplierID);

            this.isSupplierNotReceived = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured while fetching suppliers", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
          })
      });


    this._inventoryService.getProductDescription(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((description) => {
        this.productDescription = description["data"][0];
        this.productDescription = _.mapValues(this.productDescription, v => v == "null" ? '' : v);

        // Fill the form
        this.productDescriptionForm.patchValue(this.productDescription);
        this.productDescriptionForm.patchValue({
          internalKeywords: this.productDescription["searchKeywords"]
        });
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured while fetching description", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  selectBySupplier(event): void {
    this.supplierDropdown = event;
  };

  convertToSlug(title: string) {
    return title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  };

  updateDescription(): void {
    const formValues = this.productDescriptionForm.getRawValue();
    let supplyId = null;
    const { pk_productID, fk_supplierID } = this.selectedProduct;

    if (!formValues.productName) {
      this._snackBar.open("Product Name is missing", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      })
      return;
    }

    if (!formValues.productNumber) {
      this._snackBar.open("Product Number is missing", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      })
      return;
    }

    if (this.supplierDropdown) {
      const { pk_companyID } = this.supplierDropdown;
      supplyId = pk_companyID;
    };

    const payload = {
      name: formValues.productName,
      product_number: formValues.productNumber,
      product_desc: formValues.productDesc || '',
      mini_desc: formValues.miniDesc || '',
      keywords: formValues.keywords || '',
      notes: formValues.notes || '',
      supplier_link: formValues.supplierLink || '',
      meta_desc: formValues.metaDesc || '',
      sex: formValues.sex || 0,
      search_keywords: formValues.internalKeywords || '',
      purchase_order_notes: formValues.purchaseOrderNotes || '',
      last_update_by: "" || '',
      last_update_date: "" || '',
      update_history: "" || '',
      product_id: pk_productID,
      supplier_id: supplyId || fk_supplierID,
      permalink: formValues.ProductPermalink,
      description: true
    };

    this.descriptionLoader = true;
    this._inventoryService.updatePhysicsAndDescription(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.descriptionLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  copyDescriptionToMeta(): void {
    const formValues = this.productDescriptionForm.getRawValue();
    if (formValues.productDesc.length) {
      var div = document.createElement("div");
      div.innerHTML = formValues.productDesc;
      var text = div.textContent || div.innerText || "";

      // Fill the form
      this.productDescriptionForm.patchValue({
        metaDesc: text
      });
    }
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
    }, 3000);
  };

}
