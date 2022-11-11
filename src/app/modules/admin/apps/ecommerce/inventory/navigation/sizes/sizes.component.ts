import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sizes',
  templateUrl: './sizes.component.html'
})
export class SizesComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['select', 'sizeName', 'run', 'weight', 'unitsPerWeight'];
  displayedColumnsChart: string[] = ['name'];
  dataSource = [];
  dataSourceCharts = [];
  sizesLength: number = 0;
  chartsLength: number = 0;

  selection = new SelectionModel<any>(true, []);

  featureForm: FormGroup;
  featureType = null;
  flashMessage: 'success' | 'error' | 'missing' | null = null;

  selectedRowsLength: number;
  page = 1;
  chartPage = 1;

  arrayToUpdate = [];

  // boolean
  featureAddLoader = false;
  sizeUpdateLoader = false;

  searchKeywordTerm = '';
  tempDataSource = [];
  tempDataCount = 0;

  isSearchLoading: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.featureForm = this._formBuilder.group({
      order: ['1'],
      feature: ['', Validators.required]
    });

    this.getSizes(this.page);
  };
  searchKeyword(ev) {
    const keyword = ev.target.value;
    this.searchKeywordTerm = keyword;
    if (keyword.length > 0) {
      this.isSearchLoading = true;
      this._changeDetectorRef.markForCheck();
      this.getSizes(1);
    } else {
      this.dataSource = this.tempDataSource;
      this.sizesLength = this.tempDataCount;
    }
  }
  getSizes(page: number): void {
    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getSizes(pk_productID, this.searchKeywordTerm, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((sizes) => {
        this._inventoryService.getCharts(pk_productID, page)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((charts) => {
            this.dataSourceCharts = charts["data"];
            this.chartsLength = charts["totalRecords"];

            const { selected, unSelected } = sizes["data"];
            for (const selectedObj of selected) {
              selectedObj["isSelected"] = true;
              const index = unSelected.findIndex(elem => elem.pk_sizeID == selectedObj.fk_sizeID);
              unSelected.splice(index, 1);
            }
            unSelected.forEach(element => {
              element.run = Number(0.00)
            });
            this.arrayToUpdate = selected;
            this.dataSource = selected.concat(unSelected);
            this.sizesLength = sizes["totalRecords"];
            if (this.searchKeywordTerm == '') {
              this.tempDataSource = selected.concat(unSelected);
              this.tempDataCount = sizes["totalRecords"];
            }
            this.isSearchLoading = false;
            this.isLoading = false;

            this.isLoadingChange.emit(false);
            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this.isSearchLoading = false;
            this.isLoading = false;

            this.isLoadingChange.emit(false);
            // Mark for check
            this._changeDetectorRef.markForCheck();
          });

      }, err => {
        this.isSearchLoading = false;
        this.isLoading = false;

        this.isLoadingChange.emit(false);
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getCharts(page: number): void {
    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getCharts(pk_productID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((charts) => {
        this.dataSourceCharts = charts["data"];
        this.chartsLength = charts["totalRecords"];

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
  };

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  };

  updateSizes() {
    const { pk_productID } = this.selectedProduct;
    let tempSizeArray = [];
    for (const size of this.arrayToUpdate) {
      const { run, weight, unitsPerWeight, fk_sizeID, pk_sizeID } = size;
      if (isNaN(run) || isNaN(weight) || isNaN(unitsPerWeight)) {
        return this._snackBar.open('A value appears to be missing', '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
      }
      let obj = {
        size_id: pk_sizeID || fk_sizeID,
        run: run,
        weight: weight,
        unit_per_weight: unitsPerWeight
      };
      tempSizeArray.push(obj);
    };

    const payload = {
      product_id: pk_productID,
      product_size: tempSizeArray,
      size: true
    };

    this.sizeUpdateLoader = true;
    this._inventoryService.updateSizes(payload)
      .subscribe((response) => {
        this.getSizes(1);
        this.sizeUpdateLoader = false;
        const message = response["success"] === true
          ? "Product sizes were updated successfully"
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

  rowUpdate(sizeObj, title, event) {
    const { value } = event.target;
    const { sizeName } = sizeObj;

    if (title === 'unitsPerWeight') {
      sizeObj.unitsPerWeight = parseInt(value);
    } else if (title === 'weight') {
      sizeObj.weight = Number(value);
    } else if (title === 'run') {
      sizeObj.run = Number(value);
    }

    if (!this.arrayToUpdate?.length) {
      this.arrayToUpdate.push(sizeObj);
    } else {
      let obj = this.arrayToUpdate.find(o => o.sizeName === sizeName);
      if (!obj) {
        this.arrayToUpdate.push(sizeObj);
      }
    };
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getSizes(this.page);
  };

  getNextChartData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.chartPage++;
    } else {
      this.chartPage--;
    };
    this.getCharts(this.chartPage);
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
  showFlashMessage(type: 'success' | 'error' | 'missing'): void {
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

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
