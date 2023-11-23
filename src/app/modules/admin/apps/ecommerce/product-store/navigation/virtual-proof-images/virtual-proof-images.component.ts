import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';
import { AddVirtualProofImage, DeleteVirtualProofImage } from '../../store.types';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-virtual-proof-images',
  templateUrl: './virtual-proof-images.component.html',
  styles: []
})
export class VirtualProofImagesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  virtualImages: any;
  imageValue: any;
  imagePreview: any;
  file: File;

  isUpload: boolean = false;

  ngStoreCheck: boolean = false;
  @ViewChild('deleteImage') deleteImage: ElementRef;
  deleteModalData: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.isLoading = false;
    this.getStoreProductDetail();
  }

  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.isLoading = true;
      this._changeDetectorRef.markForCheck();
      this.getVirtualImages('');
    });
  }
  getVirtualImages(msg) {
    let params = {
      store_product_virtual_proof: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.commonGetCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.virtualImages = res["data"];
      if (msg != '') {
        this._storeService.snackBar(msg);
      }
      this.isUpload = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  deleImageModal(item) {
    this.deleteModalData = item;
    $(this.deleteImage.nativeElement).modal('show');
  }
  deleteVirtualImages(item) {
    item.delLoader = true;
    let payload: DeleteVirtualProofImage = {
      virtual_proof_id: item.pk_virtualProofID,
      remove_virtual_art: true
    }
    this._storeService.putStoresProductData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this._storeService.snackBar(res["message"]);
        this.virtualImages = this.virtualImages.filter(img => img.pk_virtualProofID != item.pk_virtualProofID);
      }
      item.delLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.delLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // File Upload
  onSelect(event) {
    this.file = event.addedFiles[0];
    this.file['preview'] = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.file));
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = (event: any) => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width < 600 || image.width > 1500 || image.height < 600 || image.height > 1500) {
          this._storeService.snackBar("Virtual proof images must be at least 600px by 600px, but no larger than 1500px by 1500px.");
          this.imageValue = null;
          this.file = null;
          this._changeDetectorRef.markForCheck();
          return;
        } else if (this.file["type"] != 'image/jpeg' && this.file["type"] != 'image/jpg') {
          this._storeService.snackBar("Image should be jpg format only");
          this.file = null;
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        }
        this.imageValue = {
          imageUpload: reader.result,
          type: this.file["type"]
        };
        setTimeout(() => {
          this._changeDetectorRef.markForCheck();
        }, 200);
      }
    }
  }

  onRemove() {
    this.file = null;
    this.imageValue = null;
  }
  uploadFile(event): void {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      if (file)
        reader.readAsDataURL(file);
      reader.onload = () => {
        let image: any = new Image;
        image.src = reader.result;
        image.onload = () => {
          if (image.width < 600 || image.width > 1500 || image.height < 600 || image.height > 1500) {
            this._storeService.snackBar("Virtual proof images must be at least 600px by 600px, but no larger than 1500px by 1500px.");
            this.imageValue = null;
            this._changeDetectorRef.markForCheck();
            return;
          } else if (file["type"] != 'image/jpeg' && file["type"] != 'image/jpg') {
            this._storeService.snackBar("Image should be jpg format only");
            this.imageValue = null;
            this._changeDetectorRef.markForCheck();
            return;
          }
          this.imageValue = {
            imageUpload: reader.result,
            type: file["type"]
          };
        }
      }
    }
  };
  uploadMedia(id) {
    let base64;
    const { imageUpload } = this.imageValue;
    base64 = imageUpload.split(",")[1];
    const img_path = `/globalAssets/StoreProducts/VirtualProofs/${this.selectedProduct.pk_storeProductID}/${id}.jpg`;

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };
    this._storeService.postStoresProductsData(payload).subscribe(res => {
      // this.isUpload = false;
      this.getVirtualImages(res["message"]);
      this.imageValue = null;
      this.file = null;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpload = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  addVirtualImages() {
    if (!this.imageValue) {
      this._storeService.snackBar('Image is required');
      return;
    }
    this.isUpload = true;
    let payload: AddVirtualProofImage = {
      store_product_id: this.selectedProduct.pk_storeProductID,
      blnStore: this.ngStoreCheck,
      add_virtual_art: true
    }
    this._storeService.postStoresProductsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.uploadMedia(res["new_id"]);
      } else {
        this.isUpload = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isUpload = false;
      this._changeDetectorRef.markForCheck();
    });
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
