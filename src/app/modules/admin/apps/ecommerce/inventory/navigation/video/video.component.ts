import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html'
})
export class VideoComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  videosLength: number = 0;
  videoLength: number = 0;
  videoUploadForm: FormGroup;
  embeddedLink: string = "";
  images: FileList = null;
  videoLink: string = "";
  imageRequired: string = '';
  videoUpdateLoader = false;
  flashMessage: 'success' | 'error' | null = null;

  url: SafeResourceUrl;
  @ViewChild('videoImg') videoImg: ElementRef;
  mainImageValue: any;
  imgLogoExit: boolean = false;
  videoData: any;
  imgUrl = environment.assetsURL;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _commonService: DashboardsService,
    private _formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.videoUploadForm = this._formBuilder.group({
      video: ['', Validators.required]
    });
    this.getProductDetail();

  }
  checkImageButton() {
    const { pk_productID } = this.selectedProduct;
    const url = `${environment.assetsURL}globalAssets/Products/Videos/${pk_productID}/${pk_productID}.jpg`
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        this.imgLogoExit = true;
        this._changeDetectorRef.markForCheck();
        return true;
      };

      img.onerror = () => {
        this.imgLogoExit = false;
        this._changeDetectorRef.markForCheck();
        return;
      };
    };
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        const { pk_productID } = this.selectedProduct;
        this.checkImageButton();
        this._inventoryService.getVideoByProductId(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((video) => {
            if (video["data"]?.length) {
              this.videoData = video["data"][0];
              this.videoLink = video["data"][0].video;
              this.embeddedLink = `//www.youtube.com/embed/${this.getId(this.videoLink)}`;
              this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.embeddedLink);
            };
            this.videoLength = video["totalRecords"];
            this.videoUploadForm.patchValue(video["data"][0]);
            this.isLoading = false;

            this._changeDetectorRef.markForCheck();
          });

        this._inventoryService.getVideos()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((videos) => {

            this.videosLength = videos["totalRecords"];
            this._changeDetectorRef.markForCheck();
          }, err => {
            this._snackBar.open("Some error occured", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      }
    });
  }
  getId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11)
      ? match[2]
      : null;
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  }

  removeHttp(url) {
    return url.replace(/^https?:\/\//, '');
  }

  upload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 355 || image.height != 209) {
          this._snackBar.open("Please select image with 355px width and 209px height!", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.videoImg.nativeElement.value = '';
          this._changeDetectorRef.markForCheck();
          return;
        }
        this.mainImageValue = {
          imageUpload: reader.result
        };
      }
    }
  }

  uploadImage(): void {
    const button = this.images?.length ? this.images[0].name : '';
    const videoLink = this.videoUploadForm.getRawValue().video;
    const payload = {
      video: videoLink ? this.removeHttp(videoLink) : '',
      button: button,
      product_id: this.selectedProduct.pk_productID,
      videos: true
    };
    this.videoUpdateLoader = true;
    this._inventoryService.updateVideo(payload)
      .subscribe((response: any) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.videoUpdateLoader = false;

        this.ngOnInit();
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.videoUpdateLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

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
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}

