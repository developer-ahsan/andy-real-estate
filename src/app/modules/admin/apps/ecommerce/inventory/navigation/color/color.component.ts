import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { Colors } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import * as _ from 'lodash';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export interface PostColor {
  product_id: number;
  color: true;
  colors: Color[]
};
interface Color {
  color_id: number;
  the_run: string;
  rgb: string;
};

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styles: ['.img_wrp { display: inline - block; position: relative;} .close {position: absolute;top: 10px;right: 150px;}']
})
export class ColorComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isColorsFetching: boolean = false;
  colors: Colors[] = [];
  displayedColumns: string[] = ['select', 'color', 'run', 'hex', 'upload'];
  dataSource: any = [];
  selection = new SelectionModel<any>(true, []);

  selectedColor: any = {};
  arrayToUpdate = [];
  colorForm: FormGroup;
  colorValue = '#000000';
  hexColor;
  flashMessage: 'success' | 'error' | null = null;

  images = null;
  imagesArrayToUpdate = [];
  fileName: string = "";

  colorsList: any = [];
  selectedColorsList: any = [];
  dummyColorsList: any = [];
  colorList = [];
  defaultResetValue: number = 0.00;

  updateImageTouched: boolean = false;

  isAllColors: boolean = true;

  // Boolean
  colorUpdateLoader = false;
  colorAddLoader = false;
  deleteLoader = false;
  colorDropdownSettings: IDropdownSettings = {};

  public colorName = new FormControl();
  results: any[];

  imageValue: any;
  isColorLoading: boolean;

  isDefaultColor: boolean = false;
  customColorsList: any = [];
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  colorTempImage: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _httpClient: HttpClient,
    private _snackBar: MatSnackBar
  ) { }

  initColorForm() {
    this.colorForm = this._formBuilder.group({
      colors: ['', Validators.required],
      run: ['0.00'],
      hex: ['']
    });
  };

  changeDefaultColor() {
    this.isDefaultColor = !this.isDefaultColor;
  }
  addCustomColors(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    const index = this.dataSource.findIndex(color => color.colorName == value);
    if (index >= 0) {
      this._snackBar.open("Color already exist in the list", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      if (this.customColorsList.length == 0) {
        this.customColorsList.push({ colorId: null, colorName: value, image: null, run: '0.0', hex: '' });
      } else {
        const index = this.customColorsList.findIndex(color => color.colorName == value);
        if (index >= 0) {
          // this._snackBar.open("Color already exist in the list", '', {
          //   horizontalPosition: 'center',
          //   verticalPosition: 'bottom',
          //   duration: 3000
          // });
        } else {
          this.customColorsList.push({ colorId: null, colorName: value, image: null, run: '0.0', hex: '' });
        }
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeCustomColor(color): void {
    const index = this.customColorsList.findIndex(colors => colors.colorName == color.colorName);
    if (index >= 0) {
      this.customColorsList.splice(index, 1);
    }
  }
  ngOnInit(): void {
    this.initColorForm();
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

    // Color select autocomplete field

    this.colorName.valueChanges.pipe(debounceTime(500), tap(() => {
      //   this.errorMsg = "";
      this.results = [];
      this.isColorLoading = true;
    }),
      switchMap(value => this._httpClient.get(environment.products + "?color=true&size=20&color_name=" + value)
        .pipe(
          finalize(() => {
            this.isColorLoading = false
          }),
        )
      )
    )
      .subscribe(data => {
        this.results = data["data"] as any[];
        this._changeDetectorRef.markForCheck();
      });

  };

  colorSelected(result: any): void {
    const index = this.dataSource.findIndex(color => color.colorName == result.colorName);
    if (index >= 0) {
      this._snackBar.open("Color already exist in the list", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      if (this.selectedColorsList.length == 0) {
        this.selectedColorsList.push({ colorId: result.pk_colorID, colorName: result.colorName });
      } else {
        var obj = this.selectedColorsList.filter((val) => {
          return val.colorId == result.pk_colorID;
        });
        if (obj.length == 0) {
          this.selectedColorsList.push({ colorId: result.pk_colorID, colorName: result.colorName });
        }
      }
      this.selectedColor = result;
    }

    this.colorName.setValue(null);
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

  uploadImage(event): void {
    this.updateImageTouched = true;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageValue = {
        imageUpload: reader.result,
        type: file["type"]
      };
    };
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

  upload(event, index) {
    this.updateImageTouched = true;
    // this.imagesArrayToUpdate.push({
    //   imageUpload: reader.result,
    //   name: fk_colorID,
    //   type: file["type"]
    // });

    this.imageValue = null;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageValue = {
        imageUpload: reader.result,
        type: file["type"]
      };
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 600 || image.height != 600) {
          this._snackBar.open("Dimensions allowed are 600px x 600px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageValue = null;
          this.colorTempImage = null;
          this._changeDetectorRef.markForCheck();
          return;
        };

        if (type != "image/jpeg") {
          this._snackBar.open("Image extensions are allowed in JPG", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.colorTempImage = null;
          this._changeDetectorRef.markForCheck();
          return;
        }
        const base64 = this.imageValue.imageUpload.split(",")[1];
        this.colorTempImage = null;
        this.dataSource[index]["media"] = this.imageValue.imageUpload;
        this.dataSource[index]["type"] = type;
        this._changeDetectorRef.markForCheck();
      };
    }
  };
  removeColorImage(index) {
    this.colorTempImage = null;
    this.dataSource[index].media = null;
    this.dataSource[index].type = null;

    this._changeDetectorRef.markForCheck();
  }

  uploadColorMedia(obj: any) {
    const { pk_productID } = this.selectedProduct;
    const { imageUpload, name, type } = obj;


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
  }

  updateColor() {
    const { pk_productID } = this.selectedProduct;

    if (this.updateImageTouched) {

      for (const obj of this.dataSource) {
        if (obj.media && obj.type) {
          let payload = {
            imageUpload: obj.media,
            name: obj.fk_colorID,
            type: obj.type
          }
          this.uploadColorMedia(payload);
        }
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
              color.media = `${environment.productMedia}/Colors/${pk_productID}/${fk_colorID}.jpg?${Math.random()}`;
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
    this.colorForm.patchValue({ hex: this.colorValue });
  };

  addColor() {
    const { pk_productID } = this.selectedProduct;
    const { run, hex } = this.colorForm.getRawValue();

    const { pk_colorID } = this.selectedColor;




    if (!pk_colorID && this.customColorsList.length == 0) {
      return this._snackBar.open("Please select color", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
    };

    // if (this.imageValue) {
    //   const { imageUpload, type } = this.imageValue;
    //   if (imageUpload) {
    //     let paylaod = {
    //       imageUpload: imageUpload,
    //       type: type,
    //       name: pk_colorID
    //     }
    //     this.uploadColorMedia(paylaod);
    //   }
    // }

    let colors: any = [];
    this.selectedColorsList.forEach(element => {
      if (element.colorId != "") {
        colors.push({
          color_id: element.colorId,
          the_run: run,
          rgb: hex
        })
      }
    });
    let custom_colors: any = [];
    this.customColorsList.forEach(element => {
      if (element.colorName != "") {
        custom_colors.push({
          color_name: element.colorName,
          the_run: run,
          rgb: hex
        })
      }

    });
    const payload = {
      product_id: pk_productID,
      color: true,
      colors: colors,
      custom_colors: custom_colors
    };

    this.colorAddLoader = true;
    this._inventoryService.addColors(payload)
      .subscribe((response) => {
        // let val: any = document.getElementById('image')
        // val.value = null;
        // this.imageValue = null;
        this._inventoryService.getColors(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((colors) => {
            this.colorName.setValue(null);
            this.selectedColor = [];
            this.customColorsList = [];
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
            this._snackBar.open("Colors added successfully", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
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
  };

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

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
