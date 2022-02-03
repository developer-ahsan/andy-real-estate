import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Reviews } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html'
})
export class ReviewsComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  images: FileList = null;
  imageRequired: string = '';
  reviewsData: Reviews = null;
  reviewsDataLength: number = 0;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getReviewByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((reviewsData) => {
        this.reviewsData = reviewsData["data"];
        this.reviewsDataLength = reviewsData["totalRecords"];

        console.log("reviews ", this.reviewsData)

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
