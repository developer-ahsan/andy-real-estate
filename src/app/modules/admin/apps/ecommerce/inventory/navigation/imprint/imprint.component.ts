import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html'
})
export class ImprintComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['location', 'method', 'decorator', 'active'];
  imprintDisplayedColumns: string[] = ['id', 'name', 'decorator', 'order', 'action'];
  dataSource = [];
  dataSource2 = [];
  selectedValue: string;
  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  imprints = [];
  dataSourceLength: number = 0;
  dataSource2Length: number = 0;
  page: number = 1;
  flashMessage: 'success' | 'error' | null = null;

  priceInclusionForm: FormGroup;
  testPricingForm: FormGroup;

  favoriteSeason: string;
  seasons: string[] = [
    'Per color (i.e. silk screening, pad printing, etc.)',
    'Per Stitch (embroidering)',
    'Simple Process (i.e. laser engraving, full color, etc.)'
  ];

  // boolean
  imprintList = true;
  displayList = true;
  priceInclusionLoader = false;
  updateLoader = false;
  deleteLoader = false;

  showImprintScreen = "";

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    this.priceInclusionForm = this._formBuilder.group({
      checkBox: ['']
    })

    this.testPricingForm = this._formBuilder.group({
      option1: [''],
      option2: ['']
    })
    // Defalut selected button toggle
    this.showImprintScreen = 'Imprints';
    this.getImprints(this.page);

    this.isLoadingChange.emit(false);
  };

  updateImprintDisplay(data): void {
    console.log("imprint order", data);
  };

  getImprints(page?: number) {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getImprints(pk_productID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((imprint) => {
        if (this.imprintList && this.displayList) {
          this.dataSource = imprint["data"];
          this.dataSourceLength = imprint["totalRecords"];
          this.dataSource2 = imprint["data"];
          this.dataSource2Length = imprint["totalRecords"];
        }

        if (this.imprintList && !this.displayList) {
          this.dataSource = imprint["data"];
          this.dataSourceLength = imprint["totalRecords"];
        }

        if (!this.imprintList && this.displayList) {
          this.dataSource2 = imprint["data"];
          this.dataSource2Length = imprint["totalRecords"];
        }
        console.log("this.dataSource", this.dataSource)
        this._changeDetectorRef.markForCheck();
      });
  }

  updatePriceInclusion(): void {
    console.log("updatePriceInclusion");
  };

  updateData(): void {
    console.log("update data");
  }

  deletAllImprints(): void {
    const { pk_productID } = this.selectedProduct;

    this.deleteLoader = true;
    this._inventoryService.deleteImprints(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {

        const message = response["success"] === true
          ? "Product imprints successfully removed"
          : "An error occurred, try again!"

        this.deleteLoader = false;

        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        this.ngOnInit();
        // Mark for Check
        this._changeDetectorRef.markForCheck();
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

    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  };

  calledScreen(screenName): void {
    if (screenName === "Display Order" || screenName === "Imprints") {
      this.page = 1;
      this.getImprints(this.page);
    }
    this.showImprintScreen = screenName;
  }

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.displayList = false;
    this.imprintList = true;
    this.getImprints(this.page);
  }

  getDisplayNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.displayList = true;
    this.imprintList = false;
    this.getImprints(this.page);
  }
}
