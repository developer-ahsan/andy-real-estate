import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sizes',
  templateUrl: './sizes.component.html'
})
export class SizesComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['select', 'sizeName', 'run', 'weight', 'unitsPerWeight'];
  dataSource = [];
  sizesLength: number = 0;

  selection = new SelectionModel<any>(true, []);

  featureForm: FormGroup;
  featureType = null;
  flashMessage: 'success' | 'error' | null = null;

  selectedRowsLength: number;
  page = 1;

  // boolean
  featureAddLoader = false;


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.featureForm = this._formBuilder.group({
      order: ['1'],
      feature: ['', Validators.required]
    });

    this.getSizes(this.page);
    this.isLoadingChange.emit(false);
  };

  getSizes(page: number): void {
    this._inventoryService.getSizes(page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((sizes) => {
        this.dataSource = sizes["data"];
        this.sizesLength = sizes["totalRecords"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    this.selectedRowsLength = this.selection.selected.length;
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSizes(this.page);
  };

  addFeature(): void {
    const { pk_productID, fk_supplierID } = this.selectedProduct;
    const { pk_attributeTypeID } = this.featureType;
    const { order, feature } = this.featureForm.getRawValue();
    const payload = {
      attribute_type_id: parseInt(pk_attributeTypeID),
      attribute_text: feature,
      supplier_id: parseInt(fk_supplierID),
      product_id: parseInt(pk_productID),
      order: parseInt(order),
      feature: true
    };
    console.log("payload", payload);
    this.featureAddLoader = true;
    this._inventoryService.addFeature(payload)
      .subscribe((response) => {
        this.featureAddLoader = false;
        this.featureForm.reset({
          order: 1,
          feature: ''
        });
        this.ngOnInit();
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };


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
