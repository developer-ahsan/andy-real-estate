import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AddRapidBuildStoreProduct } from '../../store.types';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-store-images',
  templateUrl: './images.component.html',
  styles: ["ngx-dropzone {height: 125px} ngx-dropzone-preview {min-height: 100px !important;height: 100px !important}"],
  animations: [
    trigger('modalAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(4rem) scale(0.95)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      })),
      transition(':enter', animate('300ms ease-out')),
      transition(':leave', animate('200ms ease-in'))
    ]),
    trigger('backdropAnimation', [
      state('void', style({
        opacity: 0
      })),
      state('*', style({
        opacity: 1
      })),
      transition(':enter', animate('300ms ease-out')),
      transition(':leave', animate('200ms ease-in'))
    ])
  ]
})
export class StoreImagesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  imagesData: any;
  file: File;
  imageValue: any;
  mainImageValue: any;
  addImageLoader: boolean = false;
  removeImageLoader: boolean = false;

  hires: any;
  hiresImgUrl = null;

  main: any;
  mainImgUrl = null;

  thumb: any;
  thumbImgUrl = null;

  isRemoveImageModal: boolean = false;
  // Blank
  blank: any;
  blankImgUrl = null;
  blankImage: File;
  blankImageValue: any;
  blankLoader: boolean = false;
  addBlankLoader: boolean = false;

  rapidComment: string = '';
  isRapidModal: boolean = false;
  isRapidBuildLoader: boolean = false;
  ngPlan: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.getStoreProductDetail();
  }
  onSelectMain(event) {
    this.file = event.addedFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 600 || image.height != 600) {
          this._storeService.snackBar("Dimensions should be 600px by 600px.");
          this.file = null;
          this._changeDetectorRef.markForCheck();
          return;
        } else if (this.file["type"] != 'image/jpeg' && this.file["type"] != 'image/jpg') {
          this._storeService.snackBar("Image should be jpg format only");
          this.file = null;
          this._changeDetectorRef.markForCheck();
          return;
        }
        this.mainImageValue = {
          imageUpload: reader.result,
          type: this.file["type"]
        };
      }
    }
  }
  onRemoveMain() {
    this.file = null;
  }
  uploadMainImages() {
    if (this.ngPlan) {
      this.addImageLoader = true;
      const imageUrl = `https://assets.consolidus.com/globalAssets/Products/HiRes/${this.ngPlan}.jpg?063205`;
      let payload = {
        path: imageUrl,
        convert_store_image_64: true
      }
      this._storeService.postStoresProductsData(payload).subscribe(res => {
        const paths: string[] = [`/globalAssets/Products/Images/${this.selectedProduct.pk_storeProductID}.jpg`, `/globalAssets/Products/HiRes/${this.selectedProduct.pk_storeProductID}.jpg`, `/globalAssets/Products/Thumbnails/${this.selectedProduct.pk_storeProductID}.jpg`];
        this.addImageLoader = true;
        const uploadObservables: Observable<any>[] = paths.map(path => {
          return this.uploadMediMainBase64(path, res["base64"]);
        });
        forkJoin(uploadObservables).subscribe(
          () => {
            this.hiresImgUrl = `https://assets.consolidus.com/globalAssets/Products/HiRes/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
            this.mainImgUrl = `https://assets.consolidus.com/globalAssets/Products/Images/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
            this.thumbImgUrl = `https://assets.consolidus.com/globalAssets/Products/Thumbnails/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
            this._storeService.snackBar('Image Updated Successfully');
            this.file = null;
            this.addImageLoader = false;
            this._changeDetectorRef.markForCheck();
          },
          (error) => {
            this.addImageLoader = false;
            this._changeDetectorRef.markForCheck();
          }
        );
      })
    } else {
      if (!this.file) {
        this._storeService.snackBar('Please choose any image');
        return;
      }
      const paths: string[] = [`/globalAssets/Products/Images/${this.selectedProduct.pk_storeProductID}.jpg`, `/globalAssets/Products/HiRes/${this.selectedProduct.pk_storeProductID}.jpg`, `/globalAssets/Products/Thumbnails/${this.selectedProduct.pk_storeProductID}.jpg`];
      this.addImageLoader = true;
      const uploadObservables: Observable<any>[] = paths.map(path => {
        return this.uploadMediMain(path);
      });
      forkJoin(uploadObservables).subscribe(
        () => {
          this.hiresImgUrl = `https://assets.consolidus.com/globalAssets/Products/HiRes/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
          this.mainImgUrl = `https://assets.consolidus.com/globalAssets/Products/Images/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
          this.thumbImgUrl = `https://assets.consolidus.com/globalAssets/Products/Thumbnails/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
          this._storeService.snackBar('Image Updated Successfully');
          this.file = null;
          this.addImageLoader = false;
          this._changeDetectorRef.markForCheck();
        },
        (error) => {
          this.addImageLoader = false;
          this._changeDetectorRef.markForCheck();
        }
      );
    }
  }
  uploadMediMainBase64(path, base64) {
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: path
    };
    return this._storeService.addMedia(payload);
  }
  uploadMediMain(path) {
    const { imageUpload, type } = this.mainImageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: path
    };
    return this._storeService.addMedia(payload);
  }
  onSelectBlank(event) {
    this.blankImage = event.addedFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.blankImage);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 600 || image.height != 600) {
          this._storeService.snackBar("Dimensions should be 600px by 600px.");
          this.blankImage = null;
          this._changeDetectorRef.markForCheck();
          return;
        } else if (this.blankImage["type"] != 'image/jpeg' && this.blankImage["type"] != 'image/jpg') {
          this._storeService.snackBar("Image should be jpg format only");
          this.blankImage = null;
          this._changeDetectorRef.markForCheck();
          return;
        }
        this.blankImageValue = {
          imageUpload: reader.result,
          type: this.blankImage["type"]
        };
      }
    }
  }

  onRemove() {
    this.blankImage = null;
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.blankImgUrl = `https://assets.consolidus.com/globalAssets/Products/BlankImages/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
      this.hiresImgUrl = `https://assets.consolidus.com/globalAssets/Products/HiRes/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
      this.mainImgUrl = `https://assets.consolidus.com/globalAssets/Products/Images/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
      this.thumbImgUrl = `https://assets.consolidus.com/globalAssets/Products/Thumbnails/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;

      this.checkIfImageExists(this.hiresImgUrl, 'hires');
      this.checkIfImageExists(this.mainImgUrl, 'main');
      this.checkIfImageExists(this.thumbImgUrl, 'thumb');
      this.checkIfImageExists(this.blankImgUrl, 'blank');
      this.isLoading = true;
      this.getImages();
    });
  }
  getImages() {
    let params = {
      images: true,
      product_id: this.selectedProduct.fk_productID,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imagesData = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  checkIfImageExists(url, type) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        if (type == 'hires') {
          this.hires = true;
        } else if (type == 'main') {
          this.main = true;
        } else if (type == 'thumb') {
          this.thumb = true;
        } else if (type == 'blank') {
          this.blank = true;
        }
        this._changeDetectorRef.markForCheck();
      };
      img.onerror = () => {
        if (type == 'hires') {
          this.hires = false;
        } else if (type == 'main') {
          this.main = false;
        } else if (type == 'thumb') {
          this.thumb = false;
        } else if (type == 'blank') {
          this.blank = false;
        }
        this._changeDetectorRef.markForCheck();
        return;
      };
    }
  };
  removeImageModal() {
    this.isRemoveImageModal = true;
    this._changeDetectorRef.markForCheck();
  }
  removeOtherImages() {
    this.isRemoveImageModal = false;
    const paths: string[] = [`/Products/Images/${this.selectedProduct.pk_storeProductID}.jpg`, `/Products/HiRes/${this.selectedProduct.pk_storeProductID}.jpg`, `/Products/Thumbnails/${this.selectedProduct.pk_storeProductID}.jpg`];
    this.removeImageLoader = true;
    const uploadObservables: Observable<any>[] = paths.map(path => {
      return this.removeMainImage(path);
    });
    forkJoin(uploadObservables).subscribe(
      () => {
        this.hiresImgUrl = `https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg?${Math.random()}`;
        this.mainImgUrl = `https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg?${Math.random()}`;
        this.thumbImgUrl = `https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg?${Math.random()}`;
        this._storeService.snackBar('Image Removed Successfully');
        this.hires = false;
        this.main = false;
        this.thumb = false;
        this.removeImageLoader = false;
        this._changeDetectorRef.markForCheck();
      },
      (error) => {
        this.removeImageLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    );
  }
  removeMainImage(path) {
    let payload = {
      image_path: path,
      delete_image: true
    }
    return this._storeService.removeMedia(payload);
  }
  removeImage(type) {
    let path;

    if (type == 'blank') {
      this.blankLoader = true;
      path = `Products/BlankImages/${this.selectedProduct.pk_storeProductID}.jpg`
    }
    let payload = {
      image_path: path,
      delete_image: true
    }
    this._storeService.removeMedia(payload)
      .subscribe((response) => {
        this._storeService.snackBar('Image Removed Successfully');
        if (type == 'blank') {
          this.blankImgUrl = 'https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg?' + Math.random();
          this.blank = false;
          this.blankImage = null;
          this.blankLoader = false;
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.blankLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  uploadMedia(check: any) {
    let image;
    let path;
    if (check == 'blank') {
      image = this.blankImageValue;
      if (!this.blankImage) {
        this._storeService.snackBar('Please Choose any Image');
        return;
      }
      path = `/globalAssets/Products/BlankImages/${this.selectedProduct.pk_storeProductID}.jpg`
      this.addBlankLoader = true;
    }
    const { imageUpload, type } = image;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: path
    };
    this.blankImgUrl = null;
    this._storeService.addMedia(payload)
      .subscribe((response) => {
        this.blankImage = null;
        this.blankImgUrl = `https://assets.consolidus.com/globalAssets/Products/BlankImages/${this.selectedProduct.pk_storeProductID}.jpg?${Math.random()}`;
        this.blank = true;
        this._storeService.snackBar('Image Uploaded Successfully');
        this.addBlankLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.addBlankLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  addRapidBuildOpenModal() {
    this.isRapidModal = true;
    this._changeDetectorRef.markForCheck();
  }
  addToRapidBuild() {
    this.isRapidBuildLoader = true;
    this.isRapidModal = false;
    this._changeDetectorRef.markForCheck();
    let payload: AddRapidBuildStoreProduct = {
      storeProductID: this.selectedProduct.pk_storeProductID,
      comments: this.rapidComment,
      add_rapidBuild_storeProduct: true
    }
    this._storeService.postStoresProductsData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["message"]) {
        this._storeService.snackBar(res["message"]);
      }
      this.isRapidBuildLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRapidBuildLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  convertImageUrlToBase64(url: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.http.get(url, { responseType: 'blob' })
        .subscribe((blob: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, reject);
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
