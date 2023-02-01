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
  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
  }

  UpdateVideo() {
    if (this.videoUrl != '') {
      this.isUpdateLoading = true;
      let payload = {
        video: this.videoUrl ? this.removeHttp(this.videoUrl) : '',
        button: this.images?.length ? this.images[0].name : '',
        store_product_id: Number(this.selectedProduct.pk_storeProductID),
        video_update: true
      }
      this._storeService.UpdateVideo(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.isUpdateLoading = false;
        this.getVideos();
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
