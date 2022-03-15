import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { AddFeature } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';

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
  selection;
  featureForm: FormGroup;
  featureType = null;
  flashMessage: 'success' | 'error' | null = null;
  featureAddLoader = false;

  featuresSelected = [];
  page = 1;

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

    this.featureForm = this._formBuilder.group({
      order: ['1'],
      feature: ['', Validators.required]
    });

    this.getFeatures(1);

    this._inventoryService.getFeaturesSupplierAndType(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((type) => {
        this.featureType = type["data"][0];
      });
    this.isLoadingChange.emit(false);
  }

  getFeatures(page: number): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getFeatures(pk_productID, page)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((features) => {
        this.dataSource = features["data"];
        this._changeDetectorRef.markForCheck();
      });
  }

  uploadImage(): void {
    console.log("uploadImage");
  }

  selectFeatureRow(data): void {
    const { fk_attributeID } = data;
    if (this.featuresSelected?.length) {
      if (this.featuresSelected.some(feature => feature.fk_attributeID == fk_attributeID)) {
        let removeIndex = this.featuresSelected.map(item => item.fk_attributeID).indexOf(fk_attributeID);
        this.featuresSelected.splice(removeIndex, 1);
      } else {
        this.featuresSelected.push(data);
      }
    } else {
      this.featuresSelected.push(data);
    }

    console.log("this.featuresSelected", this.featuresSelected);
  };

  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getFeatures(this.page);
  }

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
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.ngOnInit();

        // Mark for check
        this._changeDetectorRef.markForCheck();
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
