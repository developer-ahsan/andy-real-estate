import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-store-videos',
  templateUrl: './videos.component.html'
})
export class StoreProductVideosComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  videoUrl: string = '';
  videoButton: string = '';
  isUpdateLoading: boolean = false;
  isRemoveLoading: boolean = false;

  videoData = [];
  images: FileList;
  imageValue: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.isLoading = true;
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.getVideos();

    });
  }
  getVideos() {
    let params = {
      store_product_videos: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.getStoreProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.videoData = res["data"];
      if (this.videoData.length > 0) {
        this.videoUrl = this.videoData[0].video;
        this.videoButton = this.videoData[0].button;
      }

      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
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
          if (image.width != 355 || image.height != 209) {
            this._storeService.snackBar("Dimensions should be 355px X 209px.");
            this.imageValue = null;
            this._changeDetectorRef.markForCheck();
            return;
          } else if (file["type"] != 'image/jpeg' && file["type"] != 'image/jpg') {
            this._storeService.snackBar("Image should be jpg format only");
            this.imageValue = null;
            this._changeDetectorRef.markForCheck();
            return;
          }
          this.videoButton = file.name;
          this.imageValue = {
            imageUpload: reader.result,
            type: file["type"]
          };
        }
      }
    }
  };

  UpdateVideo() {
    if (this.videoUrl != '') {
      this.isUpdateLoading = true;
      let payload = {
        video: this.videoUrl ? this.removeHttp(this.videoUrl) : '',
        button: this.imageValue ? this.videoButton : '',
        store_product_id: Number(this.selectedProduct.pk_storeProductID),
        video_update: true
      }
      this._storeService.UpdateVideo(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.isUpdateLoading = false;
        this.getVideos();
        if (this.imageValue) {
          this.uploadMedia();
        }
        this._storeService.snackBar('Store product video updated successfully');
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isUpdateLoading = false;
        this._changeDetectorRef.markForCheck();
      })
    } else {
      this._storeService.snackBar('Please fill required fields');
    }
  }
  uploadMedia() {
    let base64;
    const { imageUpload } = this.imageValue;
    base64 = imageUpload.split(",")[1];
    const img_path = `/globalAssets/StoreProducts/Videos/${this.selectedProduct.pk_storeProductID}/${this.selectedProduct.pk_storeProductID}.jpg`;

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };
    this._storeService.postStoresProductsData(payload).subscribe(res => {
      this.imageValue = null;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  removeHttp(url) {
    return url.replace(/^https?:\/\//, '');
  }
  RemoveVideo() {
    this.isRemoveLoading = true;
    if (this.videoUrl != '') {
      let payload = {
        store_product_id: Number(this.selectedProduct.pk_storeProductID),
        delete_store_product_video: true
      }
      this._storeService.RemoveVideo(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.videoData = [];
        this.videoUrl = '';
        this.videoButton = '';
        this.isRemoveLoading = false;
        this._storeService.snackBar('Store product video removed successfully');
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isRemoveLoading = false;
        this._changeDetectorRef.markForCheck();
      })
    } else {
      this._storeService.snackBar('Please fill input fields');
    }
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
