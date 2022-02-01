import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html'
})
export class PackageComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['select', 'packaging', 'run', 'setup', 'packagingUnit', 'po'];
  dataSource: Package[] = [];
  dataSourceLength: number = 0;
  pageSize: number = 10;
  pageNo: number = 0;
  selection;

  dataLoader = false;

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
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getAllPackages(this.pageSize, this.pageNo)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((packages) => {

        console.log("packages ", packages)
        this.dataSource = packages["data"];
        this.dataSourceLength = packages["totalRecords"];
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getPackageyProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pack) => {

        console.log("pack ", pack)
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  pageEvents(event: any) {
    this.dataLoader = true;
    const { pageSize, pageIndex } = event;
    this._inventoryService.getAllPackages(pageSize, pageIndex)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((packages) => {

        console.log("packages found", packages)
        this.dataSource = packages["data"];
        this.dataSourceLength = packages["totalRecords"];

        this.dataLoader = false;
      });

  }

}
