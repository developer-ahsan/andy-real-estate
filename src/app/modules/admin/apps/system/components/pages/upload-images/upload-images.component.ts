import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { SystemService } from '../../system.service';
import { takeUntil } from 'rxjs/operators';
import { DeleteImage } from '../../system.types';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class UploadImagesComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('fileInput') fileInput: ElementRef;

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
          name: file["name"]
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
    const { imageUpload, name, type } = this.imageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Uploads/${name}`
    };
    this._systemService.addImprintMedia(payload)
      .subscribe((response) => {
        this.fileInput.nativeElement.value = '';
        this.imageValue = null;
        this.images.push({ FILENAME: name })
        this._systemService.snackBar('Image Uploaded Successfully');
        this.isAddLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  removeImage(index, image) {
    let payload: DeleteImage = {
      image_path: `/Uploads/${image.FILENAME}`,
      delete_image: true
    }
    image.delLoader = true;
    this._systemService.removeMedia(payload)
      .subscribe((response) => {
        this._systemService.snackBar('Image Removed Successfully');
        this.images.splice(index, 1);
        image.delLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        image.delLoader = false;
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
