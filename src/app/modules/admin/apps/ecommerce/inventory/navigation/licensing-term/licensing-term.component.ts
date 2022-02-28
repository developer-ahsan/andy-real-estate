import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-licensing-term',
  templateUrl: './licensing-term.component.html'
})
export class LicensingTermComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  panelOpenState = false;

  selected;
  selectedTerm;
  subCategoryItems = [];
  foods = [];
  licensingTerms = [];
  licensingForm: FormGroup;
  loader = false;

  expansionLoader = false;

  selectedTermObject = null;

  selectedRadioOption = null;

  termUpdateLoader = false;

  radioButtonForm = false;
  seasons = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.licensingForm = this._formBuilder.group({
      select: [''],
      radio: ['']
    });

    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getLicensingCompanyByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((companyTerms) => {
        if (companyTerms["data"]?.length) {
          this.radioButtonForm = true;
          this._inventoryService.getLicensingTerms(pk_productID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((licensingTerms) => {
              this.licensingTerms = licensingTerms["data"];
              for (const term of this.licensingTerms) {
                if (term.Selected === "true") {
                  this.selectedTerm = term
                }
              }
              console.log("this.licensingTerms", this.licensingTerms, this.selectedTerm);
              this._inventoryService.getLicensingSubCategory(this.selectedTerm.pk_licensingTermID, pk_productID)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((subCategories) => {
                  this.subCategoryItems = subCategories["data"];
                  console.log("this.subCategoryItems 1", this.subCategoryItems);
                  // this._changeDetectorRef.markForCheck();
                  this.isLoadingChange.emit(false);
                });
            });
        } else {
          this._inventoryService.getLicensingCompany()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((licensingCompany) => {
              this.foods = licensingCompany["data"];
              console.log("this.getLicensingCompany", this.foods);
              this._inventoryService.getLicensingTerms(pk_productID)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((licensingTerms) => {
                  this.licensingTerms = licensingTerms["data"];
                  for (const term of this.licensingTerms) {
                    if (term.Selected === "true") {
                      this.selectedTerm = term.pk_licensingTermID
                    }
                  }
                  console.log("this.licensingTerms", this.licensingTerms, this.selectedTerm);
                  this._inventoryService.getLicensingSubCategory(this.selectedTerm.pk_licensingTermID, pk_productID)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((subCategories) => {
                      this.subCategoryItems = subCategories["data"];
                      console.log("this.subCategoryItems 2", this.subCategoryItems);
                      // this._changeDetectorRef.markForCheck();
                      this.isLoadingChange.emit(false);
                    });
                });
            });
        }
      })
  }

  selectedRadio(item: MatRadioChange) {
    this.selectedRadioOption = item.value;
  }

  toggleExpansionLoader(): void {
    this.expansionLoader = !this.expansionLoader;
  }

  expansionOpened(license): void {
    if (this.selectedTerm.pk_licensingTermID === license.pk_licensingTermID) {
      return;
    }
    console.log("license", license);
    this.selectedTermObject = license;
    const { pk_licensingTermID } = license;
    const { pk_productID } = this.selectedProduct;
    this.toggleExpansionLoader();
    this._inventoryService.getLicensingSubCategory(pk_licensingTermID, pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((subCategories) => {
        this.toggleExpansionLoader();
        this.subCategoryItems = subCategories["data"];
        console.log("this.subCategoryItems 3", this.subCategoryItems);
      });
  }
  continue(): void {
    this.radioButtonForm = true;
  }

  updateTerm(): void {
    const { pk_productID } = this.selectedProduct;
    const { pk_licensingTermID } = this.selectedTerm;

    const payload = {
      product_id: pk_productID,
      licensing_term_id: this.selectedTermObject?.pk_licensingTermID || pk_licensingTermID,
      sub_category_id: this.selectedRadioOption?.pk_licensingTermSubCategoryID || 0,
      call_type: "put",
      licensing_term: true
    };

    this.termUpdateLoader = true;
    console.log("payload", payload);
    this.termUpdateLoader = false;
  }
}
