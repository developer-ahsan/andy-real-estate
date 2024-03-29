import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html'
})
export class FeatureComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
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
    public _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
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
        const { pk_productID } = this.selectedProduct;
        this._inventoryService.getFeatures(pk_productID, 1)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((features) => {
            this._inventoryService.getFeaturesSupplierAndType(pk_productID)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe((type) => {
                this.featureType = type["data"][0];
                this.dataSource = features["data"];
                this.featuresLength = features["totalRecords"];
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
              }, err => {
                this._snackBar.open("Some error occured", '', {
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  duration: 3500
                });
                this.isLoading = false;

                // Mark for check
                this._changeDetectorRef.markForCheck();
              });
          });
      }
    });
  }
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
                const message = response["success"] === true
                  ? "Attribute were deleted successfully"
                  : "Some error occured. Please try again";

                this._snackBar.open(message, '', {
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  duration: 3500
                });

                this.deleteLoader = false;
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
    if (!this.arrayToUpdate.length) {
      return this._snackBar.open("Please select rows to update", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    };
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
        attribute_text: attributeText.replace(/'/g, '"'),
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
          ? "Attribute was updated successfully"
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


        this.isLoading = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.featureUpdateLoader = false;
        this.isLoading = false;

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
    if (!feature) {
      this._snackBar.open(`Note: Feature is required.`, '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 5000
      });
      return;
    }
    const index = this.dataSource.findIndex(item => item.attributeText.toLowerCase() == feature.toLowerCase());
    if (index >= 0) {
      this._snackBar.open(`Note: This feature already exists in the list.`, '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 5000
      });
      return;
    }
    const payload = {
      attribute_type_id: Number(pk_attributeTypeID),
      attribute_text: feature.replace(/'/g, '"'),
      supplier_id: Number(fk_supplierID),
      product_id: Number(pk_productID),
      order: Number(order),
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
                this.featureForm.reset({
                  order: 1,
                  feature: ''
                });

                // if (response["success"] === false) {
                //   if (response["message"] === 'Data already exists in Database') {
                //     this.featureAddLoader = false;

                //     this._changeDetectorRef.markForCheck();
                //     return this._snackBar.open(`Note: This feature already exists in the database.`, '', {
                //       horizontalPosition: 'center',
                //       verticalPosition: 'bottom',
                //       duration: 5000
                //     });
                //   };
                // };

                this.featureAddLoader = false;
                this.showFlashMessage(
                  response["success"] === true ?
                    'success' :
                    'error'
                );

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
        this.featureUpdateLoader = false;

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
