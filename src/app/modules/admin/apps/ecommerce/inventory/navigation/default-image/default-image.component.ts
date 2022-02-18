import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-default-image',
  templateUrl: './default-image.component.html'
})
export class DefaultImageComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUrl = "";
  imageUploadForm: FormGroup;
  images = null;
  imageRequired: string = '';
  fileName: string = "";

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

    this.imageUrl = `https://assets.consolidus.com/globalAssets/Products/defaultImage/11718/11718-1.jpg`;
    console.log("imageUrl", this.imageUrl);

    this._inventoryService.getPackageByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pack) => {
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  upload(event) {
    const file = event.target.files[0];
    this.fileName = file["name"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.images = reader.result;
    };

  }

  // getImage(p_id) {
  //   return import(`https://assets.consolidus.com/globalAssets/Products/defaultImage/${p_id}`)
  //     .then((module) => {
  //       console.log("module => ", module);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     })
  // }

  uploadImage(): void {
    if (!this.images) {
      this.imageRequired = "*Please attach an image and continue"
      return;
    }
    const { pk_productID } = this.selectedProduct;
    this.imageRequired = '';
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
  }
}
