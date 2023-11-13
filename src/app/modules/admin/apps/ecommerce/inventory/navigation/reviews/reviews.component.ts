import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Reviews } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html'
})
export class ReviewsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  imageUploadForm: FormGroup;
  images: FileList = null;
  imageRequired: string = '';
  reviewsData: Reviews = null;
  reviewsDataLength: number = 0;
  storeDataLoader = false;
  storeList : any = [];

  storesData = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder,
    private _commonService: DashboardsService,
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.imageUploadForm = this._formBuilder.group({
      image: ['', Validators.required]
    });

    this._commonService.storesData$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((stores: any) => {
        stores["data"].forEach(element => {
            if (element.blnActive) {
              this.storeList.push(element);
            }
        });
        this._changeDetectorRef.markForCheck();
    });


    this.getProductDetail();
  }
  getProductDetail() {
    this.isLoading = true;
    this._inventoryService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe((details) => {
      if (details) {
        this.selectedProduct = details["data"][0];
        this.getReviews();
      }
    });
  }
  getReviews() {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getReviewByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((reviewsData) => {

        this._inventoryService.getReviewStore(pk_productID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((stores) => {
            this.storesData = stores["data"];
            this.reviewsDataLength = reviewsData["totalRecords"];
            this.reviewsData = reviewsData["data"].map(item => {
              const container = {};
              container["pk_reviewID"] = item.pk_reviewID,
                container["fk_storeProductID"] = item.fk_storeProductID,
                container["name"] = item.name,
                container["date"] = moment.utc(item.date).format("lll"),
                container["rating"] = item.rating,
                container["comment"] = item.comment,
                container["storeName"] = item.storeName,
                container["pk_storeID"] = item.pk_storeID,
                container["RowNumber"] = item.RowNumber,
                container["TotalRequests"] = item.TotalRequests

              return container;
            });

            this.isLoading = false;
            // Mark for check
            this._changeDetectorRef.markForCheck();
          });
      });
  }
  upload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.images = files;
  };

  selectByStore(event): void {
    const { pk_storeID } = event;
    const { pk_productID } = this.selectedProduct;
    this.storeDataLoader = true;

    this._inventoryService.getReviewByStoreAndProductId(pk_productID, pk_storeID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((reviewsData) => {
        this.reviewsData = reviewsData["data"];
        this.reviewsDataLength = reviewsData["totalRecords"];
        this.storeDataLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  selectByAllStores(): void {
    this.storeDataLoader = true;
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getReviewByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((reviewsData) => {
        this.reviewsData = reviewsData["data"];
        this.reviewsDataLength = reviewsData["totalRecords"];
        this.storeDataLoader = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  uploadImage(): void {
    if (!this.images) {
      this.imageRequired = "*Please attach an image and continue"
      return;
    }
    this.imageRequired = '';
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
