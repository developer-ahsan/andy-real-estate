import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';
import * as _ from 'lodash';

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
  images = null;
  fileName: string = "";
  imagesArray = [];

  imageError = "";
  isImageSaved: boolean;
  cardImageBase64 = "";

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getPackageByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pack) => {
        this._changeDetectorRef.markForCheck();
      });

    // 11718
    for (let i = 1; i <= 10; i++) {
      let url = `https://assets.consolidus.com/globalAssets/Products/defaultImage/${pk_productID}/${pk_productID}-${i}.jpg`;
      this.checkIfImageExists(url);
    };

    this.isLoadingChange.emit(false);
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
  }

  upload(event) {
    console.log("this.imagesArray", this.imagesArray)
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
      }

      if (image.width !== 600 && image.width !== 600) {
        this.imageError = 'Dimentions allowed are 600px x 600px';
        return;
      };

      const { pk_productID } = this.selectedProduct;
      const base64 = this.images.split(",")[1];
      const payload = {
        imageFile: base64,
        key: environment.mediaKey,
        filePath: `/globalAssets/Products/defaultImage./${pk_productID}/${pk_productID}-${this.fileName}`
      };

      console.log("payload", payload);
      this._inventoryService.addDefaultImage(payload)
        .subscribe((response) => {
          console.log("response => ", response)
        })
    };
  }
}
