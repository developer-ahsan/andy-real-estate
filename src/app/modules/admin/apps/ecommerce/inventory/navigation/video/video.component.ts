import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  embeddedLink: string = "";
  images: FileList = null;
  videoLink: string = "";
  imageRequired: string = '';
  videoUpdateLoader = false;
  flashMessage: 'success' | 'error' | null = null;

  url: SafeResourceUrl;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private _snackBar: MatSnackBar
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
          this.embeddedLink = `//www.youtube.com/embed/${this.getId(this.videoLink)}`;
          this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.embeddedLink);
        };
        this.videoLength = video["totalRecords"];
        this.videoUploadForm.patchValue(video["data"][0]);
        this.isLoadingChange.emit(false);

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

  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
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

