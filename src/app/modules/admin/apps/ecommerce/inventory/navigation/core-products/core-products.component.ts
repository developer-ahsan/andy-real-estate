import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors, AvailableCores } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
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
  dataSource: Colors[] = [];
  selection;
  selectedorder: string = 'select_order';
  products: string[] = [
    'YES',
    'NO'
  ];
  available_cores: AvailableCores[] = [];

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

        console.log("features ", cores)
        this.dataSource = cores["data"];
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getAvailableCoresProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((available_core) => {

        this.available_cores = available_core["data"];

        console.log("available_cores ", this.available_cores)
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  uploadImage(): void {
    console.log("uploadImage");
  }

}
