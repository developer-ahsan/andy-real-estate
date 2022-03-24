import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {

    // Create the selected product form
    this.productDescriptionForm = this._formBuilder.group({
      fk_productID: [''],
      name: [''],
      productNO: [''],
      keywords: [''],
      internalKeywords: [''],
      metaDesc: [''],
      supplierLink: [''],
      sex: [''],
      searchKeywords: [''],
      productDesc: [''],
      permalink: [''],
      optionsGuidelines: [''],
      notes: [''],
      miniDesc: [''],
      technoLogoSKU: [''],
      selectOrder: [''],
      purchase_order_notes: ['']
    });

    const { pk_productID, productName, productNumber, technoLogoSKU } = this.selectedProduct;

    // Get the suppliers
    this._inventoryService.getAllSuppliers()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((supplier) => {
        this.suppliers = supplier["data"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      })

    this._inventoryService.getProductDescription(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((description) => {

        this.productDescription = description["data"][0];
        this.productDescription["name"] = productName;
        this.productDescription["productNO"] = productNumber;
        this.productDescription["technoLogoSKU"] = technoLogoSKU;
        this.productDescription["permalink"] = this.convertToSlug(productName);

        // Fill the form
        this.productDescriptionForm.patchValue(this.productDescription);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  };

  selectBySupplier(event): void {
    console.log("supplier ", event);
  };

  convertToSlug(title: string) {
    return title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  };

  updateDescription(): void {
    const formValues = this.productDescriptionForm.getRawValue();
    console.log("formValues", formValues)
    const payload = {
      product_desc: formValues.productDesc || '',
      mini_desc: formValues.miniDesc || '',
      keywords: formValues.keywords || '',
      notes: formValues.notes || '',
      supplier_link: formValues.supplierLink || '',
      meta_desc: formValues.metaDesc || '',
      sex: formValues.sex || 0,
      search_keywords: formValues.internalKeywords || '',
      purchase_order_notes: formValues.purchase_order_notes || '',
      last_update_by: "" || '',
      last_update_date: "" || '',
      update_history: "" || '',
      product_id: formValues.fk_productID,
      description: true
    }
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

    // Copy main desceiprion to meta description
    this.productDescription["metaDesc"] = this.productDescription["productDesc"];

    // Fill the form
    this.productDescriptionForm.patchValue(this.productDescription);
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
