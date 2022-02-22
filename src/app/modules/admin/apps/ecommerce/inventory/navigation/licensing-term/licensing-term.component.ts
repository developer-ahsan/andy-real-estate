import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-licensing-term',
  templateUrl: './licensing-term.component.html'
})
export class LicensingTermComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selected;
  selectedTermId;
  subCategoryItems = [];
  foods = [];
  licensingTerms = [];
  licensingForm: FormGroup;
  loader = false;

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

    this._inventoryService.getLicensingCompany()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((licensingCompany) => {
        this.foods = licensingCompany["data"];
        console.log("this.getLicensingCompany", this.foods);
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getLicensingTerms(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((licensingTerms) => {
        this.licensingTerms = licensingTerms["data"];
        for (const term of this.licensingTerms) {
          if (term.Selected === "true") {
            this.selectedTermId = term.pk_licensingTermID
          }
        }
        console.log("this.licensingTerms", this.licensingTerms, this.selectedTermId);
        this._inventoryService.getLicensingSubCategory(this.selectedTermId)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((subCategories) => {
            this.subCategoryItems = subCategories["data"];
            this._changeDetectorRef.markForCheck();
            console.log("this.subCategoryItems", this.subCategoryItems);
          });
        this._changeDetectorRef.markForCheck();
      });


    this.isLoadingChange.emit(false);
  }

  continue(): void {
    // console.log(this.licensingForm.getRawValue());
    this.radioButtonForm = true;
    // for (const term of this.licensingTerms) {
    //   if (term.Selected === "true") {
    //     this.selectedTermId = term.pk_licensingTermID
    //   }
    // }
    // console.log("this.selectedTermId", this.selectedTermId);
    // this.loader = true;
    // this._inventoryService.getLicensingSubCategory(this.selectedTermId)
    //   .pipe(takeUntil(this._unsubscribeAll))
    //   .subscribe((subCategories) => {
    //     this.subCategoryItems = subCategories["data"];
    //     // this.loader = false;
    //     this.radioButtonForm = true;
    //     console.log("this.subCategoryItems", this.subCategoryItems);
    //   });
  }
}
