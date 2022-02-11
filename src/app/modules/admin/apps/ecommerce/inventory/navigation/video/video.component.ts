import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html'
})
export class VideoComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  videosLength: number = 0;
  videoLength: number = 0;
  videoUploadForm: FormGroup;
  images: FileList = null;
  videoLink: string = "";
  imageRequired: string = '';
  videoUpdateLoader = false;
  flashMessage: 'success' | 'error' | null = null;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.videoUploadForm = this._formBuilder.group({
      video: ['', Validators.required]
    });

    const { pk_productID } = this.selectedProduct;

    this._inventoryService.getVideoByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((video) => {
        if (video["data"]?.length) {
          this.videoLink = video["data"][0].video;
        };
        this.videoLength = video["totalRecords"];
        this.videoUploadForm.patchValue(video["data"][0]);
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getVideos()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((videos) => {

        this.videosLength = videos["totalRecords"];
        this._changeDetectorRef.markForCheck();
      });
    this.isLoadingChange.emit(false);
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  }

  removeHttp(url) {
    return url.replace(/^https?:\/\//, '');
  }

  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
  }

  uploadImage(): void {
    const button = this.images?.length ? this.images[0].name : '';
    const payload = {
      video: this.videoUploadForm.getRawValue().video,
      button: "",
      product_id: this.selectedProduct.pk_productID,
      videos: true
    };
    console.log("payload => ", payload);
    this.videoUpdateLoader = true;
    this._inventoryService.updateVideo(payload)
      .subscribe((response: any) => {
        console.log("response", response)
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.videoUpdateLoader = false;
      });
  }



  /**
   * Show flash message
   */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3000);
  }
}

