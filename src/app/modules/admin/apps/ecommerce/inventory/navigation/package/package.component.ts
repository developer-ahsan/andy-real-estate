import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html'
})
export class PackageComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['packaging', 'run', 'setup', 'packagingUnit', 'po'];
  dataSource: Package[] = [];
  dataSourceLength: number = 0;
  pageSize: number = 10;
  pageNo: number = 0;
  selection;
  zeroLengthCheckMessage = false;
  flashMessage: 'success' | 'error' | null = null;
  packageAddLoader = false;

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

    this._inventoryService.getPackageByProductId(pk_productID)
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

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  fruits = [];

  add(event): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push({ name: value });
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);
    }
  }

  addPackage(): void {
    const list = [];
    if (!this.fruits?.length) {
      this.zeroLengthCheckMessage = true;

      setTimeout(() => {
        this.zeroLengthCheckMessage = false;
      }, 2000)
      return;
    }
    for (const fruit of this.fruits) {
      list.push(fruit.name);
    };

    const payload = {
      package_name_list: list,
      packaging: true
    };
    this.packageAddLoader = true;
    this._inventoryService.addPackage(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.packageAddLoader = false;
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
