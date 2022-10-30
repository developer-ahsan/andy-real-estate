import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-licensing-term',
  templateUrl: './licensing-term.component.html'
})
export class LicensingTermComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedTerm;
  selectedSubCategItems = [];
  subCategoryItems = [];
  licensingCompanies = [];
  licensingTerms = [];
  dummyLicensingTerms = [];
  licensingForm: FormGroup;
  loader = false;
  expansionLoader = false;
  selectedTermObject = null;
  selectedRadioOption = null;
  termUpdateLoader = false;
  selectedTermUpdateLoader = false;
  radioButtonForm = true;
  showCompanyDropdown: boolean = false;

  isSelectedUpdating: boolean = false;

  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
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

        this._inventoryService.productLicensingTerms$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((licensingTerms) => {

            // Licensing terms list
            this.licensingTerms = licensingTerms["data"];
            this.dummyLicensingTerms = licensingTerms["data"];

            if (companyTerms["data"]?.length) {
              for (const term of this.licensingTerms) {
                if (term.Selected == "true") {
                  this.selectedTerm = term;
                  this.selectedTermObject = term;
                }
              };
            } else {
              this.selectedTerm = this.licensingTerms[0];
              this.selectedTermObject = this.licensingTerms[0];
              this._inventoryService.getLicensingCompany()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((licensingCompany) => {
                  this.licensingCompanies = licensingCompany["data"];

                  if (this.licensingCompanies.length > 1) {
                    this.showCompanyDropdown = true;
                    this.radioButtonForm = false;
                  };
                }, err => {
                  this._snackBar.open("Some error occured while fetching Licensing companies", '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                  });
                  this.isLoadingChange.emit(false);

                  // Mark for check
                  this._changeDetectorRef.markForCheck();
                });
            };

            this._inventoryService.getLicensingSubCategory(this.selectedTerm?.pk_licensingTermID, pk_productID)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((subCategories) => {
                this.selectedSubCategItems = subCategories["data"];

                this.isLoadingChange.emit(false);


                // Mark for check
                this._changeDetectorRef.markForCheck();
              }, err => {
                this._snackBar.open("Some error occured while fetching subcategories", '', {
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  duration: 3500
                });
                this.isLoadingChange.emit(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
              });


            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }

  selectedRadio(item: MatRadioChange) {
    this.selectedRadioOption = item.value;
  }

  toggleExpansionLoader(): void {
    this.expansionLoader = !this.expansionLoader;
  }

  expansionOpened(license): void {
    this.selectedTermObject = license;
    const { pk_licensingTermID } = license;
    const { pk_productID } = this.selectedProduct;
    this.expansionLoader = true;
    this._inventoryService.getLicensingSubCategory(pk_licensingTermID, pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((subCategories) => {
        this.subCategoryItems = subCategories["data"];
        this.expansionLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  continue(): void {
    this.radioButtonForm = true;
  }

  updateSelectedTerm(): void {
    const { pk_productID } = this.selectedProduct;
    const { pk_licensingTermID } = this.selectedTerm;

    this.isSelectedUpdating = true;

    const payload = {
      product_id: pk_productID,
      licensing_term_id: pk_licensingTermID,
      sub_category_id: this.selectedRadioOption?.pk_licensingTermSubCategoryID || 0,
      call_type: "update",
      licensing_term: true
    };

    this.selectedTermUpdateLoader = true;
    this._inventoryService.updateLicensingTerms(payload)
      .subscribe((response) => {
        this._inventoryService.getLicensingTerms(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((licensingTerms) => {
            this.licensingTerms = licensingTerms["data"];
            this.dummyLicensingTerms = licensingTerms["data"];
            for (const term of this.licensingTerms) {
              if (term.Selected === "true") {
                this.selectedTerm = term;
                this.selectedTermObject = term;
              }
            };

            this._inventoryService.getLicensingSubCategory(this.selectedTerm?.pk_licensingTermID, pk_productID)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((subCategories) => {
                this.selectedSubCategItems = subCategories["data"];
                this.selectedTermUpdateLoader = false;
                this.showFlashMessage(
                  response["success"] === true ?
                    'success' :
                    'error'
                );

                // Mark for check
                this._changeDetectorRef.markForCheck();
              });
          });
      });
  }

  updateTerm(): void {
    const { pk_productID } = this.selectedProduct;
    const { pk_licensingTermID } = this.selectedTerm;
    this.isSelectedUpdating = false;
    const payload = {
      product_id: pk_productID,
      licensing_term_id: this.selectedTermObject?.pk_licensingTermID || pk_licensingTermID,
      sub_category_id: this.selectedRadioOption?.pk_licensingTermSubCategoryID || 0,
      call_type: "update",
      licensing_term: true
    };

    this.termUpdateLoader = true;
    this._inventoryService.updateLicensingTerms(payload)
      .subscribe((response) => {
        this._inventoryService.getLicensingTerms(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((licensingTerms) => {
            this.licensingTerms = licensingTerms["data"];
            this.dummyLicensingTerms = licensingTerms["data"];
            for (const term of this.licensingTerms) {
              if (term.Selected === "true") {
                this.selectedTerm = term;
                this.selectedTermObject = term;
              }
            };

            this._inventoryService.getLicensingSubCategory(this.selectedTerm?.pk_licensingTermID, pk_productID)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((subCategories) => {
                this.selectedSubCategItems = subCategories["data"];
                this.termUpdateLoader = false;
                this.showFlashMessage(
                  response["success"] === true ?
                    'success' :
                    'error'
                );

                // Mark for check
                this._changeDetectorRef.markForCheck();
              });
          });
      });
  }

  searchKeyword(event): void {
    const value = event.target.value;

    this.licensingTerms = this.dummyLicensingTerms.filter((item: any) => {
      return item.term.toLowerCase().includes(value.toLowerCase());
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
