import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateChart } from '../../inventory.types';

@Component({
  selector: 'app-sizes',
  templateUrl: './sizes.component.html'
})
export class SizesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['select', 'sizeName', 'run', 'weight', 'unitsPerWeight'];
  displayedColumnsChart: string[] = ['radio', 'name'];
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


  isColorSize: boolean = false;
  isSizeOrColoCorrrection: boolean = false;
  selectedChart: any;
  ngSelectedChart: any;
  isChartUpdateLoader: boolean = false;

  allSizes = [];
  searchSizes = [];
  selectedSizes = [];
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
    this.getProductDetail();
  };
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getSizes(this.page);
      }
    });
  }
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
    const { pk_productID, fk_supplierID } = this.selectedProduct;
    let params = {
      product_id: pk_productID,
      apparel_sizes: true
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(sizes => {
      this._inventoryService.getCharts(pk_productID, page, fk_supplierID)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((charts) => {
          if (charts["selected_chart"].length > 0) {
            this.ngSelectedChart = charts["selected_chart"][0].pk_chartID;
          }
          this.dataSourceCharts = charts["selected_chart"].concat(charts["data"]);
          this.chartsLength = charts["totalRecords"];

          let all_selected_sizes = [];
          let all_sizes = [];
          if (sizes["product_selected_sizes"][0].product_selected_sizes) {
            let size = sizes["product_selected_sizes"][0].product_selected_sizes.split(',,');
            size.forEach(element => {
              const [name, order, id, setup, run, weight, unitsPerWeight] = element.split("::");
              all_selected_sizes.push({ sizeName: name, run: Number(run), weight: Number(weight), unitsPerWeight: Number(unitsPerWeight), setup: Number(setup), pk_sizeID: Number(id), listOrder: Number(order), checked: true, is_delete: false });
            });
          }
          if (sizes["all_sizes"][0].all_sizes) {
            let size = sizes["all_sizes"][0].all_sizes.split(',,');
            size.forEach(element => {
              const [id, name, order] = element.split("::");
              all_sizes.push({ sizeName: name, run: 0, pk_sizeID: Number(id), listOrder: Number(order), checked: false });
            });
          }
          this.selectedSizes = all_selected_sizes;
          this.allSizes = all_selected_sizes.concat(all_sizes);
          this.searchSizes = all_selected_sizes.concat(all_sizes);
          this.sizesLength = sizes["totalRecords"];
          this.getColors();

          this.isSearchLoading = false;
          this.isLoading = false;


          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.isSearchLoading = false;
          this.isLoading = false;


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

  searchSizesData(event) {
    if (event.target.value == '') {
      this.allSizes = this.searchSizes;
      return;
    }
    const results = [];

    this.searchSizes.forEach(size => {
      if (size.sizeName.toLowerCase().includes(event.target.value.toLowerCase())) {
        results.push(size);
      }
    });

    this.allSizes = results;
  }
  getCharts(page: number): void {
    const { pk_productID, fk_supplierID } = this.selectedProduct;

    this._inventoryService.getCharts(pk_productID, page, fk_supplierID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((charts) => {
        if (charts["selected_chart"].length > 0) {
          this.ngSelectedChart = charts["selected_chart"][0].pk_chartID;
        }
        this.dataSourceCharts = charts["selected_chart"].concat(charts["data"]);
        this.chartsLength = charts["totalRecords"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };
  getColors(): void {
    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getColors(pk_productID, 1)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((colors) => {
        if (colors["data"].length > 0 && this.arrayToUpdate.length > 0) {
          this.isSizeOrColoCorrrection = true;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.getColors();
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
    let productSizeObj = [];
    for (const element of this.allSizes) {
      if (element.checked) {
        if (!element.weight || !element.unitsPerWeight) {
          this._snackBar.open('Please check sizes values it should be greater than 0', '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          return; // This will exit the entire function or method
        } else {
          productSizeObj.push({
            size_id: element.pk_sizeID,
            run: element.run,
            weight: element.weight,
            unit_per_weight: element.unitsPerWeight,
            is_delete: false
          });
        }
      }
    }
    // Continue with your code here
    this.updateSizesData(productSizeObj);
  };
  updateSizesData(productSizeObj) {
    const { pk_productID } = this.selectedProduct;
    if (productSizeObj.length == 0) {
      this._snackBar.open('Please select at-least one size', '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    } else {
      this.selectedSizes.forEach(element => {
        const check = productSizeObj.some(size => element.pk_sizeID == size.size_id);
        if (!check) {
          productSizeObj.push({
            size_id: element.pk_sizeID,
            run: element.run,
            weight: element.weight,
            unit_per_weight: element.unitsPerWeight,
            is_delete: true
          })
        }
      });
      let payload = {
        product_id: pk_productID,
        product_size: productSizeObj,
        size: true
      };
      this.sizeUpdateLoader = true;
      this._inventoryService.updateSizes(payload)
        .subscribe((response) => {
          this.isLoading = true;
          this.getUpdatedSizes(1);
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
    }
  }
  getUpdatedSizes(page: number): void {
    const { pk_productID, fk_supplierID } = this.selectedProduct;
    let params = {
      product_id: pk_productID,
      apparel_sizes: true
    }
    this._inventoryService.getProductsData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(sizes => {
      let all_selected_sizes = [];
      let all_sizes = [];
      if (sizes["product_selected_sizes"][0].product_selected_sizes) {
        let size = sizes["product_selected_sizes"][0].product_selected_sizes.split(',,');
        size.forEach(element => {
          const [name, order, id, setup, run, weight, unitsPerWeight] = element.split("::");
          all_selected_sizes.push({ sizeName: name, run: Number(run), weight: Number(weight), unitsPerWeight: Number(unitsPerWeight), setup: Number(setup), pk_sizeID: Number(id), listOrder: Number(order), checked: true, is_delete: false });
        });
      }
      if (sizes["all_sizes"][0].all_sizes) {
        let size = sizes["all_sizes"][0].all_sizes.split(',,');
        size.forEach(element => {
          const [id, name, order] = element.split("::");
          all_sizes.push({ sizeName: name, run: 0, pk_sizeID: Number(id), listOrder: Number(order), checked: false });
        });
      }
      this.selectedSizes = all_selected_sizes;
      this.allSizes = all_selected_sizes.concat(all_sizes);
      this.searchSizes = all_selected_sizes.concat(all_sizes);
      this.sizesLength = sizes["totalRecords"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSearchLoading = false;
      this.isLoading = false;

      this.isLoadingChange.emit(false);
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

  colorsToggle() {
    this.isColorSize = !this.isColorSize;
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  chartSelected(event: MatRadioChange, row) {
  }
  uploadChart() {
    this.isChartUpdateLoader = true;
    let payload: UpdateChart = {
      chart_id: this.ngSelectedChart,
      product_id: this.selectedProduct.pk_productID,
      update_chart: true
    }
    this._inventoryService.putProductsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._snackBar.open(res["message"], '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
      }
      this.isChartUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isChartUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
}
