import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-default-image',
  templateUrl: './default-image.component.html'
})
export class DefaultImageComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  image = null;
  fileName: string = "";
  imagesArray = [];

  imageError = "";
  isImageSaved: boolean;
  cardImageBase64 = "";

  imageUploadLoader: boolean = false;

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

    // 11718
    for (let i = 1; i <= 10; i++) {
      let url = `${environment.productMedia}/defaultImage/${pk_productID}/${pk_productID}-${i}.jpg`;
      this.checkIfImageExists(url);
    };

    setTimeout(() => {
      this.isLoadingChange.emit(false);
    }, 2500)
  }

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
  };

  upload(event) {
    const file = event.target.files[0];
    this.fileName = file["name"];
    let fileType = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.image = {
        imageUpload: reader.result,
        fileType: fileType
      };
    };
  };

  uploadImage(): void {
    this.imageError = null;
    if (!this.image) {
      this._snackBar.open("*Please attach an image", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    };

    const { imageUpload, fileType } = this.image;
    let image = new Image;
    image.src = imageUpload;
    image.onload = () => {

      if (fileType != "image/jpeg") {
        this._snackBar.open("Image extensions are allowed in JPG", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      };

      if (image.width != 600 || image.height != 600) {
        this._snackBar.open("Dimentions allowed are 600px x 600px", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        return;
      };

      const { pk_productID } = this.selectedProduct;
      const base64 = imageUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Products/defaultImage/${pk_productID}/${pk_productID}-${this.fileName}`
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
