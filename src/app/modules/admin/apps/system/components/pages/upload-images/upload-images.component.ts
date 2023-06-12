import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { SystemService } from '../../system.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class UploadImagesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  images = [];
  isAddLoader: boolean = false;
  imageValue: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getImages();
  };
  getImages() {
    let payload = {
      files_fetch: true,
      path: `/Uploads`
    }
    this._changeDetectorRef.markForCheck();
    this._systemService.getSystemFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.images = files["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadImage(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        this.imageValue = {
          imageUpload: reader.result,
          type: file["type"],
          campaign_id: null
        };
      }
    };
  };
  uploadMedia() {
    if (!this.imageValue) {
      this._systemService.snackBar('Please Choose any Image');
      return;
    }
    this.isAddLoader = true;
    // const { pk_productID } = this.selectedProduct;
    const { imageUpload } = this.imageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Uploads/${this.images.length + 1}.jpg`
    };
    this._systemService.AddSystemData(payload)
      .subscribe((response) => {
        this.imageValue = null;
        this.images.push({ FILENAME: this.images.length + '.jpg', })
        this._systemService.snackBar('Image Uploaded Successfully');
        this.isAddLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddLoader = false;
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
