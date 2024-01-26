import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteImage } from 'app/modules/admin/apps/file-manager/stores.types';
import { SystemService } from 'app/modules/admin/apps/system/components/system.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-swatches',
  templateUrl: './swatches.component.html'
})
export class SwatchesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  images = null;
  fileName: string = "";
  imagesArray = [];

  imageUploadLoader: boolean = false;
  imageDeleteLoader: boolean = false;

  imageError = "";
  isImageSaved: boolean;
  cardImageBase64 = "";
  @ViewChild('fileInputImage') fileInputImage: ElementRef;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _systemService: SystemService,
    private _commonService: DashboardsService,

  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this.getProductDetail();
  };
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        const { pk_productID } = this.selectedProduct;

        let url = `${environment.productMedia}/Swatch/${pk_productID}/${pk_productID}.jpg`;
        this.checkIfImageExists(url);
        setTimeout(() => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        }, 2500);
      }
    });
  }
  checkIfImageExists(url) {
    const temp = Math.random();
    const img = new Image();
    img.src = url + '?' + temp;

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
    this.fileName = !this.imagesArray.length ? "1" : `${this.imagesArray.length + 1}`;
    let fileType = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.images = {
        imageUpload: reader.result,
        fileType: fileType
      };
    };
  };

  uploadImage(): void {
    this.imageError = null;
    if (!this.images) {
      this._snackBar.open("Please attach an image", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.fileInputImage.nativeElement.value = '';
      return;
    };

    let image = new Image;
    const { imageUpload, fileType } = this.images;
    image.src = imageUpload;
    image.onload = () => {
      if (fileType != "image/jpeg") {
        this._snackBar.open("Image extensions are allowed in JPG", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.images = null;
        this.fileInputImage.nativeElement.value = '';
        return;
      };

      if (image.width != 600 || image.height != 600) {
        this._snackBar.open("Dimentions allowed are 600px x 600px", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.fileInputImage.nativeElement.value = '';
        this.images = null;
        return;
      };

      const { pk_productID } = this.selectedProduct;
      const base64 = imageUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Products/Swatch/${pk_productID}/${pk_productID}.jpg`
      };

      this.imageUploadLoader = true;
      this._inventoryService.addSwatchImage(payload)
        .subscribe((response) => {
          this._snackBar.open(response["message"], '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageUploadLoader = false;
          this.imagesArray.pop();
          const temp = Math.random();
          this.imagesArray.push(`${environment.productMedia}/Swatch/${pk_productID}/${pk_productID}.jpg?${temp}`);

          this.images = null;
          this.fileInputImage.nativeElement.value = '';
          // Mark for check
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.imageUploadLoader = false;
          this._snackBar.open("Some error occured", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });

          this.fileInputImage.nativeElement.value = '';
          // Mark for check
          this._changeDetectorRef.markForCheck();
        })
    };
  };

  deleteImage() {
    const { pk_productID } = this.selectedProduct;
    let payload = {
      files: [`/globalAssets/Products/Swatch/${pk_productID}/${pk_productID}.jpg`],
      delete_multiple_files: true
    }
    this.imageDeleteLoader = true;
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this.imagesArray.pop();
        this.imageDeleteLoader = false;
        this.images = null;
        this._systemService.snackBar('Image Removed Successfully');
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.imageDeleteLoader = false;
        this._changeDetectorRef.markForCheck();
      })
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
