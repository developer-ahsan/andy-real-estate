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
  imageRequired: string = '';

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
        console.log("video", video["data"][0]);
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

  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
  }

  uploadImage(): void {
    if (!this.images) {
      this.imageRequired = "*Please attach an image and continue"
      return;
    }
    this.imageRequired = '';
    console.log("files", this.images);
  }
}

