import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
export class PackageComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  mainScreen = 'packages';

  displayedColumns: string[] = ['select', 'packaging', 'run', 'setup', 'packagingUnit', 'po'];
  dataSource: Package[] = [];
  dataSource1: Package[] = [];
  dataSourceLength: number = 0;
  pageSize: number = 10;
  pageNo: number = 1;
  zeroLengthCheckMessage = false;
  flashMessage: 'success' | 'error' | null = null;
  packageAddLoader = false;
  pageData: any;

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
  searchKeywordVal: string = '';
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  packages = [];
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    this.selectedRowsLength = this.selection.selected.length;
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */


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
    this.getProductDetail();
  };
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getPackAndAccessories();
      }
    });
  }
  calledScreen(screen) {
    this.mainScreen = screen;
  }
  updatePackage() {
    const { pk_productID } = this.selectedProduct;
    if (!this.arrayToUpdate.length) {
      return this._snackBar.open("Please select rows to update", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    };
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

    this.packageUpdateLoader = true;
    this._inventoryService.updatePackage(payload)
      .subscribe((response) => {
        const message = response["success"] === true
          ? "Product packagings were updated successfully"
          : "Some error occured. Please try again";

        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.packageUpdateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.packageUpdateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  onRowChange(ev, item) {
    if (ev.checked) {
      this.arrayToPost.push(item);
    } else {
      const index = this.arrayToPost.findIndex(elem => elem.pk_packagingID == item.pk_packagingID)
      this.arrayToPost.splice(index, 1);
    }
  }
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

    packageObj.run = packageObj.run || 0.00;
    packageObj.setup = packageObj.setup || 0.00;
    packageObj.unitsPerPackage = packageObj.unitsPerPackage || 1;

    if (title == "run") {
      packageObj.run = parseInt(value);
    };

    if (title == "setup") {
      packageObj.setup = parseInt(value);
    };

    if (title == "unitsPerPackage") {
      packageObj.unitsPerPackage = parseFloat(value);
    };

    if (!this.arrayToPost?.length) {
      this.arrayToPost.push(packageObj);
    } else {
      let obj = this.arrayToPost.find(o => o.pk_packagingID === packageObj.pk_packagingID);
      if (!obj) {
        this.arrayToPost.push(packageObj);
      }
    };
  };

  addListPackage() {
    const { pk_productID } = this.selectedProduct;

    let tempPackageArray = [];
    for (const packages of this.arrayToPost) {
      const { pk_packagingID, setup, run, unitsPerPackage, isDecorator } = packages;
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
        this.selection.clear();
        this.arrayToPost = [];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.packagePostLoader = false;
        this.selection.clear();
        this.arrayToPost = [];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
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

    let tempPackageArray = [];
    for (const packages of arrayTodelete) {
      const { fk_packagingID, setup, run, unitsPerPackage, isDecorator } = packages;
      let obj = {
        packaging_id: fk_packagingID,
        setup: setup,
        run: run,
        units_per_package: unitsPerPackage,
        bln_decorator: isDecorator === "true" ? 1 : 0
      };
      tempPackageArray.push(obj);
    };

    const { pk_productID } = this.selectedProduct;
    const payload = {
      product_id: pk_productID,
      packaging: true,
      package: tempPackageArray,
      call_type: "delete"
    };

    this.deleteLoader = true;
    this._inventoryService.updatePackage(payload)
      .subscribe((response) => {
        const message = response["success"] === true
          ? "Product packagings were deleted successfully"
          : "Some error occured. Please try again";
        this.getPackAndAccessories()
        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.deleteLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.deleteLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getPackAndAccessories(): void {
    const { pk_productID } = this.selectedProduct;
    let params = {
      keyword: this.searchKeywordVal,
      packaging: true,
      product_id: pk_productID,
      size: 20,
      page: this.pageNo
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(packages => {
      this.pageData = packages;
      const { list, selected } = packages["data"];
      let letIdsToRemoveWhichAreSelected = [];
      for (const item of selected) {
        const { fk_packagingID } = item;
        letIdsToRemoveWhichAreSelected.push(fk_packagingID)
      };

      let tempArray = [];
      let tempArray2 = [];
      this.dataSource = list.filter(item => !letIdsToRemoveWhichAreSelected.includes(item.pk_packagingID));
      this.dataSource1 = selected;
      for (const packages of this.dataSource) {
        packages.run = 0.0;
        packages.setup = 0.0;
        packages.unitsPerPackage = 0.0;
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
      this.isLoading = false;
      this.searchLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.searchLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  };



  add(event): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.packages.push({ name: value });
    }

    // Clear the input value
    event.chipInput!.clear();
  };

  searchKeyword(event): void {
    this.pageNo = 1;
    const { value } = event.target;
    this.searchKeywordVal = value;
    this.searchLoader = true;
    this.getPackAndAccessories();
  };

  remove(fruit): void {
    const index = this.packages.indexOf(fruit);

    if (index >= 0) {
      this.packages.splice(index, 1);
    }
  }

  addPackage(): void {
    const list = [];
    if (!this.packages?.length) {
      this.zeroLengthCheckMessage = true;

      setTimeout(() => {
        this.zeroLengthCheckMessage = false;
      }, 2000)
      return;
    }
    for (const fruit of this.packages) {
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
        this.packages = [];
        this.packageAddLoader = false;
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.packageAddLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.pageNo = 1;
    this.getPackAndAccessories();
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
