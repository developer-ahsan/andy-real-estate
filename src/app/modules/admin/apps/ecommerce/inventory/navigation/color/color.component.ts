import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as _ from 'lodash';
import { environment } from 'environments/environment';

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
  selection = new SelectionModel<any>(true, []);

  arrayToUpdate = [];
  colorForm: FormGroup;
  colorValue = '#000000';
  hexColor;
  flashMessage: 'success' | 'error' | null = null;

  images = null;
  imagesArrayToUpdate = [];
  fileName: string = "";

  colorsList: any = [];
  dummyColorsList: any = [];
  defaultResetValue: number = 0.00;

  updateImageTouched: boolean = false;

  isAllColors: boolean = true;

  // Boolean
  colorUpdateLoader = false;
  colorAddLoader = false;
  deleteLoader = false;
  colorDropdownSettings: IDropdownSettings = {};

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
  checkboxLabel(row?: any): void {
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

    this.colorForm = this._formBuilder.group({
      colors: ['', Validators.required],
      run: ['0.00'],
      hex: ['']
    });

    this.colorDropdownSettings = {
      singleSelection: false,
      idField: 'pk_colorID',
      textField: 'colorName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      limitSelection: 1
    };

    this.getColors();
    this.getAllColors();
  }

  getAllColors(): void {

    // Getting all colors in db
    this._inventoryService.getAllColors()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((list) => {
        let tempArray = [];
        for (const color of list["data"]) {
          const { colorName } = color;
          if (colorName) {
            tempArray.push(color);
          };
        };

        this.colorsList = tempArray;
        this.dummyColorsList = this.colorsList;
        this.isAllColors = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.getAllColors();

        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  };

  onItemSelect(item: any) {
    const { colorName } = item;
    this.colorForm.patchValue({
      colors: colorName
    });
  };

  resetRunValue(): void {
    this.colorForm.patchValue({
      run: ['0.00']
    });
  };

  checkIfImageExists(url, color) {
    const img = new Image();
    img.src = url;

    if (img.complete) {
      color["media"] = url;
    } else {
      img.onload = () => {
        color["media"] = url;
      };

      img.onerror = () => {
        color["media"] = null;
        return;
      };
    }
  };

  getColors(): void {
    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getColors(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((colors) => {
        for (const color of colors["data"]) {
          const { fk_colorID } = color;
          let image = `${environment.productMedia}/Colors/${pk_productID}/${fk_colorID}.jpg`;
          this.checkIfImageExists(image, color);
        };

        this.dataSource = colors["data"];

        setTimeout(() => {
          this.isLoadingChange.emit(false);
        }, 2000);

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.getColors();

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  uploadImage(): void {
  };

  changeColor(event) {
    const { value } = event.target;
    this.colorValue = value;
  };

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

  upload(event, element) {
    const { fk_colorID } = element;
    this.updateImageTouched = true;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imagesArrayToUpdate.push({
        imageUpload: reader.result,
        name: fk_colorID,
        type: file["type"]
      });
    };
  };

  uploadColorMedia(obj: any) {
    const { pk_productID } = this.selectedProduct;
    const { imageUpload, name, type } = obj;
    let image = new Image;
    image.src = imageUpload;
    image.onload = () => {
      if (image.width != 600 || image.height != 600) {
        this._snackBar.open("Dimentions allowed are 600px x 600px", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      };

      if (type != "image/jpeg") {
        this._snackBar.open("Image extensions are allowed in JPG", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      }

      const base64 = imageUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Products/Colors/${pk_productID}/${name}.jpg`
      };

      this._inventoryService.addColorMedia(payload)
        .subscribe((response) => {

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    };
  }

  updateColor() {
    const { pk_productID } = this.selectedProduct;

    if (this.updateImageTouched) {

      for (const obj of this.imagesArrayToUpdate) {
        this.uploadColorMedia(obj);
      };
    };

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

    const payload = {
      product_id: pk_productID,
      color_id: tempColorArray.map(a => a.fk_colorID),
      the_run: tempColorArray.map(a => `${a.run}`),
      rgb: tempColorArray.map(a => a.rgb),
      color: true,
      call_type: "update"
    };

    this.colorUpdateLoader = true;
    this._inventoryService.updateColors(payload)
      .subscribe((response) => {
        this._inventoryService.getColors(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((colors) => {
            for (const color of colors["data"]) {
              const { fk_colorID } = color;
              let image = `${environment.productMedia}/Colors/${pk_productID}/${fk_colorID}.jpg`;
              this.checkIfImageExists(image, color);
            };

            this.dataSource = colors["data"];

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
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.colorUpdateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  }
  copyColorToHex() {
    this.hexColor = this.colorValue
  };

  addColor() {
    const { pk_productID } = this.selectedProduct;
    const { colors, run, hex } = this.colorForm.getRawValue();
    var colorTempArray = colors?.length ? colors.split(',') : [];
    let colorArr = [];
    if (colorTempArray.length) {
      for (const color of colorTempArray) {
        colorArr.push(color.replace(/[^\w]/g, ""));
      }
    };

    const payload = {
      product_id: pk_productID,
      color_name: colorArr?.length ? colorArr : [],
      color_id: [],
      the_run: [run],
      rgb: [hex || this.hexColor],
      color: true
    };

    this.colorAddLoader = true;
    this._inventoryService.addColors(payload)
      .subscribe((response) => {
        this._inventoryService.getColors(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((colors) => {
            for (const color of colors["data"]) {
              const { fk_colorID } = color;
              let image = `${environment.productMedia}/Colors/${pk_productID}/${fk_colorID}.jpg`;
              this.checkIfImageExists(image, color);
            };

            this.dataSource = colors["data"];
            this.colorForm.patchValue({
              colors: [''],
              run: ['0.00'],
              hex: ['']
            });
            this.colorValue = '#000000';

            this.colorAddLoader = false;
            this.showFlashMessage(
              response["success"] === true ?
                'success' :
                'error'
            );

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.colorAddLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  deleteColors() {
    const arrayTodelete = this.selection.selected;
    if (!arrayTodelete.length) {
      return this._snackBar.open("Please select rows to delete", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    };

    const { pk_productID } = this.selectedProduct;
    let tempColorArray = [];
    for (const color of arrayTodelete) {
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

    const payload = {
      product_id: pk_productID,
      color_id: tempColorArray.map(a => a.fk_colorID),
      the_run: tempColorArray.map(a => `${a.run}`),
      rgb: tempColorArray.map(a => a.rgb),
      color: true,
      call_type: "delete"
    };

    this.deleteLoader = true;
    this._inventoryService.updateColors(payload)
      .subscribe((response) => {
        this._inventoryService.getColors(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((colors) => {
            this.dataSource = colors["data"];
            this.deleteLoader = false;
            const message = response["success"] === true
              ? "Colors deleted successfully"
              : "Some error occured. Please try again";

            this._snackBar.open(message, '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
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
