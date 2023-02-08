import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-store-images',
  templateUrl: './images.component.html',
  styles: ["ngx-dropzone {height: 125px} ngx-dropzone-preview {min-height: 100px !important;height: 100px !important}"]
})
export class StoreImagesComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  imagesData: any;
  file: File;
  imageValue: any;



  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.getStoreProductDetail();
    window.onbeforeunload = function () {
      alert('Are you sure you want to leave?');
    };
  }

  onSelect(event) {
    this.file = event.addedFiles[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 600 || image.height != 600) {
          this._storeService.snackBar("Dimensions should be 600px by 600px.");
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
      }
    }
  }

  onRemove() {
    this.file = null;
    this.imageValue = null;
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.isLoading = true;
      this.getImages();
    });
  }
  getImages() {
    let params = {
      images: true,
      product_id: this.selectedProduct.fk_productID
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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
