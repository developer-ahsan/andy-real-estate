import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html'
})
export class FeatureComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['select', 'order', 'feature'];
  dataSource = [];
  featuresLength: number = 0;

  selection = new SelectionModel<any>(true, []);

  featureForm: FormGroup;
  featureType = null;
  flashMessage: 'success' | 'error' | null = null;

  selectedRowsLength: number;
  page = 1;

  arrayToUpdate = [];

  // boolean
  featureAddLoader = false;
  featureUpdateLoader = false;
  deleteLoader = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {

    const { pk_productID } = this.selectedProduct;

    this.featureForm = this._formBuilder.group({
      order: ['1'],
      feature: ['', Validators.required]
    });

    this._inventoryService.getFeatures(pk_productID, 1)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((features) => {
        this._inventoryService.getFeaturesSupplierAndType(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((type) => {
            this.featureType = type["data"][0];
            this.dataSource = features["data"];
            this.featuresLength = features["totalRecords"];
            this.isLoadingChange.emit(false);

            // Mark for check
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.isLoadingChange.emit(false);

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      });
  };

  rowUpdate(featureObj, title, event) {
    const { value } = event.target;
    const { fk_attributeID } = featureObj;

    if (title === 'listOrder') {
      featureObj.listOrder = parseInt(value);
    } else if (title === 'attributeText') {
      featureObj.attributeText = value;
    };

    if (!this.arrayToUpdate?.length) {
      this.arrayToUpdate.push(featureObj);
    } else {
      let obj = this.arrayToUpdate.find(o => o.fk_attributeID === fk_attributeID);
      if (!obj) {
        this.arrayToUpdate.push(featureObj);
      }
    };
  };

  deleteFeatures() {
    const arrayTodelete = this.selection.selected;
    if (!arrayTodelete.length) {
      return this._snackBar.open("Please select rows to delete", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    };
    const { pk_productID } = this.selectedProduct;
    let tempFeatureArray = [];
    for (const feature of arrayTodelete) {
      const { fk_attributeTypeID, attributeText, fk_attributeID, listOrder } = feature;
      let obj = {
        attribute_type_id: fk_attributeTypeID,
        attribute_text: attributeText,
        attribute_id: fk_attributeID,
        order: listOrder
      };
      tempFeatureArray.push(obj);
    };

    const payload = {
      product_id: pk_productID,
      update_type: "delete",
      feature: tempFeatureArray,
      features: true
    };

    this.deleteLoader = true;
    this._inventoryService.updateFeatures(payload)
      .subscribe((response) => {
        this._inventoryService.getFeatures(pk_productID, 1)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((features) => {
            this._inventoryService.getFeaturesSupplierAndType(pk_productID)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((type) => {
                this.featureType = type["data"][0];
                this.dataSource = features["data"];
                this.featuresLength = features["totalRecords"];
                this.deleteLoader = false;
                const message = response["success"] === true
                  ? "Attribute were deleted successfully"
                  : "Some error occured. Please try again";

                this._snackBar.open(message, '', {
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  duration: 3500
                });
                // Mark for check
                this._changeDetectorRef.markForCheck();
              });
          });
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
  }

  updateFeatures() {
    const { pk_productID } = this.selectedProduct;
    let tempFeatureArray = [];
    for (const feature of this.arrayToUpdate) {
      const { fk_attributeTypeID, attributeText, fk_attributeID, listOrder } = feature;
      if (!listOrder || !attributeText?.length) {
        return this._snackBar.open('A value appears to be missing', '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
      }
      let obj = {
        attribute_type_id: fk_attributeTypeID,
        attribute_text: attributeText,
        attribute_id: fk_attributeID,
        order: listOrder
      };
      tempFeatureArray.push(obj);
    };

    const payload = {
      product_id: pk_productID,
      update_type: "update",
      feature: tempFeatureArray,
      features: true
    };

    this.featureUpdateLoader = true;
    this._inventoryService.updateFeatures(payload)
      .subscribe((response) => {
        this.featureUpdateLoader = false;
        const message = response["success"] === true
          ? "Attribute was added successfully"
          : "Some error occured. Please try again";

        this._snackBar.open(message, '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.featureUpdateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  getFeatures(page: number): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getFeatures(pk_productID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((features) => {
        this.dataSource = features["data"];
        this.featuresLength = features["totalRecords"];

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
    this.getFeatures(this.page);
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
        this._inventoryService.getFeatures(pk_productID, 1)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((features) => {
            this._inventoryService.getFeaturesSupplierAndType(pk_productID)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((type) => {
                this.featureType = type["data"][0];
                this.dataSource = features["data"];
                this.featuresLength = features["totalRecords"];
                this.featureAddLoader = false;
                this.featureForm.reset({
                  order: 1,
                  feature: ''
                });

                if (response["success"] === false) {
                  if (response["message"] === 'Data already exists in Database') {
                    return this._snackBar.open(`Unable to add feature. ${response["message"]}`, '', {
                      horizontalPosition: 'center',
                      verticalPosition: 'bottom',
                      duration: 5000
                    });
                  };
                };

                this.showFlashMessage(
                  response["success"] === true ?
                    'success' :
                    'error'
                );

                // Mark for check
                this._changeDetectorRef.markForCheck();
              });
          });
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
