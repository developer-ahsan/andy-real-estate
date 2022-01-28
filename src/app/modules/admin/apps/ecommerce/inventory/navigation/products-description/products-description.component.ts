import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { ProductsDetails } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
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
      technoLogoSKU: ['']
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
    console.log("updateDescription");
  }


}
