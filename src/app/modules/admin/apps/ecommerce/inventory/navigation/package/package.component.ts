import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  dataSource1: Package[] = [];
  dataSourceLength: number = 0;
  pageSize: number = 10;
  pageNo: number = 1;
  zeroLengthCheckMessage = false;
  flashMessage: 'success' | 'error' | null = null;
  packageAddLoader = false;

  packageUpdateLoader = false;
  packagePostLoader = false;
  deleteLoader = false;

  selection = new SelectionModel<any>(true, []);
  selectedRowsLength: number;

  arrayToUpdate = [];
  arrayToPost = [];

  dataLoader = false;
  domain = "true";

  searchLoader = false;

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
  };

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  };

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getPackAndAccessories();
  };

  updatePackage() {
    console.log("this.arrayToUpdate", this.arrayToUpdate)
    const { pk_productID } = this.selectedProduct;

    let tempPackageArray = [];
    for (const packages of this.arrayToUpdate) {
      const { fk_packagingID, setup, run, unitsPerPackage, blnDecoratorPO, isDecorator } = packages;
      let obj = {
        packaging_id: fk_packagingID,
        setup: setup,
        run: run,
        units_per_package: unitsPerPackage,
        bln_decorator: isDecorator === "true" ? 1 : 0
      };
      tempPackageArray.push(obj);
    };

    const payload = {
      product_id: pk_productID,
      packaging: true,
      package: tempPackageArray,
      call_type: "put"
    }
    console.log("payload", payload);

    this.packageUpdateLoader = true;
    this._inventoryService.updatePackage(payload)
      .subscribe((response) => {
        this.packageUpdateLoader = false;
        const message = response["success"] === true
          ? "Product packagings were updated successfully"
          : "Some error occured. Please try again";

        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  rowUpdate(packageObj, title, event) {
    const { value } = title !== 'blnDecoratorPO' ? event.target : event;

    if (title === 'run') {
      packageObj.run = parseInt(value);
    } else if (title === 'setup') {
      packageObj.setup = parseInt(value);
    } else if (title === 'unitsPerPackage') {
      packageObj.unitsPerPackage = parseFloat(value);
    }

    if (!this.arrayToUpdate?.length) {
      this.arrayToUpdate.push(packageObj);
    } else {
      let obj = this.arrayToUpdate.find(o => o.fk_packagingID === packageObj.fk_packagingID);
      if (!obj) {
        this.arrayToUpdate.push(packageObj);
      }
    };
  };

  rowAddPackage(packageObj, title, event) {
    const { value } = title !== 'blnDecoratorPO' ? event.target : event;
    console.log("packageObj", packageObj)

    if (title === 'run') {
      packageObj.run = parseInt(value);
    } else if (title === 'setup') {
      packageObj.setup = parseInt(value);
    } else if (title === 'unitsPerPackage') {
      packageObj.unitsPerPackage = parseFloat(value);
    }

    if (!this.arrayToPost?.length) {
      this.arrayToPost.push(packageObj);
    } else {
      let obj = this.arrayToPost.find(o => o.pk_packagingID === packageObj.pk_packagingID);
      if (!obj) {
        this.arrayToPost.push(packageObj);
      }
    };
  };

  deletePackages() {
    const arrayTodelete = this.selection.selected;
    if (!arrayTodelete.length) {
      return this._snackBar.open("Please select rows to delete", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    };
    const { pk_productID } = this.selectedProduct;

    let tempPackageArray = [];
    for (const packages of this.arrayToPost) {
      const { pk_packagingID, setup, run, unitsPerPackage, blnDecoratorPO, isDecorator } = packages;
      let obj = {
        packaging_id: pk_packagingID,
        setup: setup,
        run: run,
        units_per_package: unitsPerPackage,
        bln_decorator: isDecorator === "true" ? 1 : 0
      };
      tempPackageArray.push(obj);
    };

    const payload = {
      product_id: pk_productID,
      packaging: true,
      package: tempPackageArray,
      call_type: "delete"
    }
    console.log("payload", payload);
    this.deleteLoader = true;
    this._inventoryService.updatePackage(payload)
      .subscribe((response) => {
        this.deleteLoader = false;
        const message = response["success"] === true
          ? "Product packagings were updated successfully"
          : "Some error occured. Please try again";
        this.getPackAndAccessories()
        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  addListPackage() {
    console.log("this.arrayToPost", this.arrayToPost)
    const { pk_productID } = this.selectedProduct;

    let tempPackageArray = [];
    for (const packages of this.arrayToPost) {
      const { pk_packagingID, setup, run, unitsPerPackage, blnDecoratorPO, isDecorator } = packages;
      let obj = {
        packaging_id: pk_packagingID,
        setup: setup,
        run: run,
        units_per_package: unitsPerPackage,
        bln_decorator: isDecorator === "true" ? 1 : 0
      };
      tempPackageArray.push(obj);
    };

    const payload = {
      product_id: pk_productID,
      packaging: true,
      package: tempPackageArray,
      call_type: "post"
    }
    console.log("payload", payload);

    this.packagePostLoader = true;
    this._inventoryService.updatePackage(payload)
      .subscribe((response) => {
        this.packagePostLoader = false;
        const message = response["success"] === true
          ? "Product packagings were added successfully"
          : "Some error occured. Please try again";
        this.getPackAndAccessories()
        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getPackAndAccessories(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getAllPackages(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((packages) => {
        const { list, selected } = packages["data"];
        let tempArray = [];
        let tempArray2 = [];
        this.dataSource = list;
        this.dataSource1 = selected;
        for (const packages of this.dataSource) {
          tempArray.push(packages)
          const { blnDecoratorPO } = packages;
          if (blnDecoratorPO) {
            this.domain = "true"
          } else {
            this.domain = "false"
          }
          packages["isDecorator"] = this.domain;
          tempArray.push(packages);
        };

        for (const packages of this.dataSource1) {
          tempArray2.push(packages)
          const { blnDecoratorPO } = packages;
          if (blnDecoratorPO) {
            this.domain = "true"
          } else {
            this.domain = "false"
          }
          packages["isDecorator"] = this.domain;
          tempArray2.push(packages);
        };

        this.dataSourceLength = packages["totalRecords"];
        this.isLoadingChange.emit(false);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

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
  };

  searchKeyword(event): void {
    const { value } = event.target;

    this.searchLoader = true;
    this._inventoryService.getPackageByKeyword(value)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((packages) => {
        const { list } = packages["data"];
        let tempArray = [];
        this.dataSource = list;
        for (const packages of this.dataSource) {
          tempArray.push(packages)
          const { blnDecoratorPO } = packages;
          if (blnDecoratorPO) {
            this.domain = "true"
          } else {
            this.domain = "false"
          }
          packages["isDecorator"] = this.domain;
          tempArray.push(packages);
        };
        this.dataSourceLength = packages["totalRecords"];
        this.searchLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

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
  };

  getDisplayNextData(event) {
    const { previousPageIndex, pageIndex } = event;
    if (pageIndex > previousPageIndex) {
      this.pageNo++;
    } else {
      this.pageNo--;
    };

    this.getPackAndAccessories();
  }
}
