import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html'
})
export class ColorComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  colors: Colors[] = [];
  displayedColumns: string[] = ['select', 'color', 'run', 'hex', 'upload'];
  dataSource: Colors[] = [];
  selection = new SelectionModel<PeriodicElement>(true, []);

  arrayToUpdate = [];
  colorForm: FormGroup;
  colorValue = '#000000';
  hexColor;
  // Boolean
  colorUpdateLoader = false;

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
  checkboxLabel(row?: PeriodicElement): void {
    // if (!row) {
    //   return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    // }
    // return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;

    this.colorForm = this._formBuilder.group({
      order: ['1'],
      feature: ['', Validators.required]
    });

    this._inventoryService.getColors(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((colors) => {
        this.dataSource = colors["data"];

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  uploadImage(): void {
    console.log("uploadImage");
  };

  changeColor(event) {
    const { value } = event.target;
    this.colorValue = value;
  }
  rowUpdate(colorObj, title, event) {
    const { value } = event.target;
    const { fk_colorID } = colorObj;

    if (title === 'run') {
      colorObj.run = parseInt(value);
    } else if (title === 'rgb') {
      colorObj.rgb = value;
    };

    if (!this.arrayToUpdate?.length) {
      this.arrayToUpdate.push(colorObj);
    } else {
      let obj = this.arrayToUpdate.find(o => o.fk_colorID === fk_colorID);
      if (!obj) {
        this.arrayToUpdate.push(colorObj);
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
    console.log("arrayTodelete", arrayTodelete)
  }
  updateColor() {
    const { pk_productID } = this.selectedProduct;
    let tempColorArray = [];
    for (const color of this.arrayToUpdate) {
      const { run, rgb, fk_colorID } = color;
      if (isNaN(run) || !rgb?.length) {
        return this._snackBar.open('A value appears to be missing', '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
      }
      let obj = {
        fk_colorID: fk_colorID,
        rgb: rgb,
        run: run
      };
      tempColorArray.push(obj);
    };

    console.log("tempColor", tempColorArray)

    const payload = {
      product_id: pk_productID,
      color_id: tempColorArray.map(a => a.fk_colorID),
      the_run: tempColorArray.map(a => `${a.run}`),
      rgb: tempColorArray.map(a => a.rgb),
      color: true
    };

    console.log("payload", payload);

    this.colorUpdateLoader = true;
    this._inventoryService.updateColors(payload)
      .subscribe((response) => {
        this.colorUpdateLoader = false;
        const message = response["success"] === true
          ? "Colors updated successfully"
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
  copyColorToHex() {
    this.hexColor = this.colorValue
  };

}
