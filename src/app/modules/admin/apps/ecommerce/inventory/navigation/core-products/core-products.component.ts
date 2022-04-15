import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors, AvailableCores, SubCategories, Categories } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-core-products',
  templateUrl: './core-products.component.html'
})
export class CoreProductsComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['core', 'category', 'sub_category'];
  flashMessage: 'success' | 'error' | null = null;
  dataSource: Colors[] = [];
  selection;
  selectedorder: string = 'select_order';
  products: string[] = [
    'YES',
    'NO'
  ];
  available_cores: AvailableCores[] = [];
  categories: Categories[] = [];
  subCategory: SubCategories[] = [];

  selectedCore = null;
  selectedCategory = null;
  selectedSubCategory = null;

  isCategory = false;
  isSubCategory = false;
  coreAddLoader = false;

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    // const numRows = this.dataSource.data.length;
    // return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    // if (this.isAllSelected()) {
    //   this.selection.clear();
    //   return;
    // }

    // this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row): void {
    // if (!row) {
    //   return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    // }
    // return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {

    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getCoresByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((cores) => {
        this.dataSource = cores["data"];
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getAvailableCoresProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((available_core) => {
        this.available_cores = available_core["data"];
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  uploadImage(): void {
    console.log("uploadImage");
  }

  coreSelection(cores): void {
    const { pk_coreID } = cores;
    this.selectedCore = cores;
    this._inventoryService.getCategoriesByCoreId(pk_coreID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((categories) => {
        this.categories = categories["data"];

        this._changeDetectorRef.markForCheck();
      });
  }

  categorySelection(category): void {
    const { pk_categoryID } = category;
    this.selectedCategory = category;
    this._inventoryService.getSubCategoriesByCoreId(pk_categoryID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((subCategories) => {
        this.subCategory = subCategories["data"];

        this._changeDetectorRef.markForCheck();
      });
  }

  subCategorySelection(subCategory): void {
    const { pk_subCategoryID } = subCategory;
    this.selectedSubCategory = subCategory;
  }

  addCore(): void {
    const { pk_subCategoryID } = this.selectedSubCategory;
    const { pk_productID } = this.selectedProduct;
    const payload = {
      product_id: pk_productID,
      sub_category_id: pk_subCategoryID,
      core: true
    }
    this.coreAddLoader = true;
    this._inventoryService.addCore(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.coreAddLoader = false;

        this.ngOnInit();
        this.selectedSubCategory = "";
        this.selectedCategory = "";
        this.selectedCore = "";

        // Mark for check
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
  }
}
