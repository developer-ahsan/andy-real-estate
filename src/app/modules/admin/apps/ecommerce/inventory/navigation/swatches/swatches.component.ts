import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-swatches',
  templateUrl: './swatches.component.html'
})
export class SwatchesComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  images = null;
  fileName: string = "";
  imagesArray = [];

  imageUploadLoader: boolean = false;

  imageError = "";
  isImageSaved: boolean;
  cardImageBase64 = "";

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    const { pk_productID } = this.selectedProduct;

    let url = `https://assets.consolidus.com/globalAssets/Products/Swatch/${pk_productID}/${pk_productID}-1.jpg`;
    this.checkIfImageExists(url);

    setTimeout(() => {
      this.isLoadingChange.emit(false);
    }, 2500)
  };

  checkIfImageExists(url) {
    const img = new Image();
    img.src = url;

    if (img.complete) {
      this.imagesArray.push(url);
    } else {
      img.onload = () => {
        this.imagesArray.push(url);
      };

      img.onerror = () => {
        return;
      };
    }
  }

  upload(event) {
    const file = event.target.files[0];
    this.fileName = file["name"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.images = reader.result;
    };
  };

  uploadImage(): void {
    this.imageError = null;
    if (!this.images) {
      this.imageError = "*Please attach an image and continue";
      return;
    };

    let image = new Image;
    image.src = this.images;
    image.onload = () => {
      const base64Data = this.images;
      const allowed_types = ['jpg', 'jpeg'];
      const [, type] = base64Data.split(';')[0].split('/');
      if (!_.includes(allowed_types, type)) {
        this.imageError = 'Image extensions are allowed in JPG';
        return;
      };

      const { pk_productID } = this.selectedProduct;
      const base64 = this.images.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Products/Swatch/${pk_productID}/${pk_productID}-${this.fileName}`
      };

      this.imageUploadLoader = true;
      this._inventoryService.addDefaultImage(payload)
        .subscribe((response) => {
          this._snackBar.open(response["message"], '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageUploadLoader = false;
          this.ngOnInit();

          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.imageUploadLoader = false;
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });

          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    };
  }
}
