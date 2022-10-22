import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html'
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  reviewColumns: string[] = ['name', 'date', 'rating', 'status', 'action'];
  reviewData = [];
  reviewTotal: number = 0;
  reviewPage: number = 1;
  isEditReview: boolean = false;
  editReviewData: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.getReviews(1);

  }
  getReviews(page) {
    let params = {
      page: page,
      store_product_reviews: true,
      store_product_id: this.selectedProduct.pk_storeProductID
    }
    this._storeService.commonGetCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.reviewData = res["data"];
      this.reviewTotal = res["totalRecords"];
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoadingChange.emit(false);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.reviewPage++;
    } else {
      this.reviewPage--;
    };
    this.getReviews(this.reviewPage);
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
