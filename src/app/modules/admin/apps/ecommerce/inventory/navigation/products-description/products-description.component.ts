import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { productDescription } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
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

  productDescription = [];
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
      selectOrder: ['']
    });

    const { pk_productID, productName, productNumber, technoLogoSKU } = this.selectedProduct;
    this._inventoryService.getProductDescription(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((description) => {
        this.productDescription = description["data"][0];
        this.productDescription["name"] = productName;
        this.productDescription["productNO"] = productNumber;
        this.productDescription["technoLogoSKU"] = technoLogoSKU;

        // Fill the form
        this.productDescriptionForm.patchValue(this.productDescription);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  updateDescription(): void {
    const formValues = this.productDescriptionForm.getRawValue();
    const payload = {
      product_desc: formValues.productDesc || '',
      mini_desc: formValues.miniDesc || '',
      keywords: formValues.keywords || '',
      notes: formValues.notes || '',
      supplier_link: formValues.supplierLink || '',
      meta_desc: formValues.metaDesc || '',
      sex: formValues.sex || '',
      search_keywords: formValues.notes || '',
      purchase_order_notes: formValues.notes || '',
      last_update_by: "" || '',
      last_update_date: "" || '',
      update_history: "" || '',
      product_id: formValues.fk_productID,
      description: true
    }
    console.log("payload => ", payload)
    this.descriptionLoader = true;
    this._inventoryService.updatePhysicsAndDescription({
      "description": true,
      "keywords": "bottle,sport,USA,drinkingbottle,sport,USA,drinking",
      "last_update_by": "",
      "last_update_date": "",
      "meta_desc": "bottle,sport,USA,drinkingbottle,sport,USA,drinking",
      "mini_desc": "USA-made, BPA-free sports bottle is made with recycled materials.USA-made, BPA-free sports bottle is made with recycled materials.",
      "notes": "USA-made, BPA-free sports bottle is made with ",
      "product_desc": "USA-made, BPA-free sports bottle is made with recycled materials. Twist-on lid with push/pull drinking spout. CPSIA Certified, Phthalate-free, Non-Toxic and Lead-free.USA-made, BPA-free sports bottle is made with recycled materials. Twist-on lid with push/pull drinking spout. CPSIA Certified, Phthalate-free, Non-Toxic and Lead-free.",
      "product_id": 6196,
      "purchase_order_notes": "",
      "search_keywords": "bottle,sport,USA,drinking",
      "sex": "",
      "supplier_link": "USA-made, BPA-free sports bottle is made with ",
      "update_history": ""
    })
      .subscribe((response: any) => {
        console.log("response", response)
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.descriptionLoader = false;
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
    }, 3000);
  }

}
