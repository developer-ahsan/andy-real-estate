import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  selectedValue: string;
  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  imprints = [];
  flashMessage: 'success' | 'error' | null = null;

  // boolean
  priceInclusionLoader = false;
  updateLoader = false;
  deleteLoader = false;

  showImprintScreen = "Imprints";

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getImprints(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((imprint) => {
        this.dataSource = imprint["data"];
        console.log("this.dataSource", this.dataSource)
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  };

  updateImprintDisplay(data): void {
    console.log("imprint order", data);
  };

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
    this.showImprintScreen = screenName;
  }
}
