import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { AddReview, DeleteReview, UpdateReview } from '../../store.types';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ProductReviewsComponent implements OnInit, OnDestroy {
  selectedProduct: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  reviewColumns: string[] = ['name', 'date', 'rating', 'status', 'action'];
  reviewData = [];
  reviewTotal: number = 0;
  reviewPage: number = 1;
  isEditReview: boolean = false;
  editReviewData: any;

  mainScreen: string = 'Current Reviews';

  productAddReviewForm: FormGroup;
  updateProductReviewForm: FormGroup;
  editData: any;
  isUpdateLoader: boolean = false;
  isAddLoader: boolean = false;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService
  ) { }

  ngOnInit(): void {
    this.productAddReviewForm = new FormGroup({
      name: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      date: new FormControl(moment().format("MM/DD/YYYY")),
      rating: new FormControl(1, Validators.required),
      comment: new FormControl('')
    })
    this.updateProductReviewForm = new FormGroup({
      pk_reviewID: new FormControl('', Validators.required),
      blnActive: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      date: new FormControl(moment().format("MM/DD/YYYY")),
      rating: new FormControl(1, Validators.required),
      comment: new FormControl(''),
      response: new FormControl('')
    })
    // Create the selected product form
    this.getStoreProductDetail();
  }
  getStoreProductDetail() {
    this._storeService.product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.selectedProduct = res["data"][0];
      this.isLoading = true;
      this.getReviews(1);
    });
  }
  editToggle(data) {
    this.editData = data;
    this.updateProductReviewForm.patchValue(data);
    this.isEditReview = !this.isEditReview;
  }
  backToReviews() {
    this.isEditReview = false;
  }
  calledScreen(value) {
    this.mainScreen = value;
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
      this.mainScreen = 'Current Reviews';
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

  removeReviews(element): void {
    element.deleteLoader = true;
    let payload: DeleteReview = {
      pk_reviewID: element.pk_reviewID,
      delete_review: true
    }
    this._storeService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.reviewData = this.reviewData.filter(item => item.pk_reviewID != element.pk_reviewID);
        this.reviewTotal--;
        if (res["success"]) {
          this._storeService.snackBar('Review Deleted Successfully');
        }
        element.deleteLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        element.deleteLoader = false;
        this._changeDetectorRef.markForCheck()
      });
  }
  updateProductReview() {
    const { name, date, rating, comment, response, blnActive, pk_reviewID } = this.updateProductReviewForm.getRawValue();

    if (name.trim() === '' || date.trim() === '') {
      this._storeService.snackBar('Please fill all required fields');
      return;
    }

    let payload: UpdateReview = {
      name:name.trim(),
      date,
      rating,
      comment:comment.trim(),
      response:response.trim(),
      blnActive,
      pk_reviewID,
      storeProductId:
        this.editData.fk_storeProductID,
      update_review: true
    };
    this.isUpdateLoader = true;
    this._storeService.putStoresData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload))
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (response["success"] === true) {
          this._storeService.snackBar('Review Updated Successfully');
        }
        this.isUpdateLoader = false;
        this.editData.name = name;
        this.editData.date = date;
        this.editData.rating = rating;
        this.editData.comment = comment;
        this.editData.response = response;
        this.editData.blnActive = blnActive;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  addProductReview() {
    const { name, date, rating, comment, company } = this.productAddReviewForm.getRawValue();

    if (name.trim() === '' || company.trim() === '') {
      this._storeService.snackBar('Please fill all required fields');
      return;
    }

    let payload: AddReview = {
      name: name.trim(),
      date,
      rating,
      comment: comment.trim(),
      storeProductId:
        this.selectedProduct.pk_storeProductID,
      add_review: true
    };
    this.isAddLoader = true;
    this._storeService.postStoresData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload))
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (response["success"] === true) {
          this._storeService.snackBar('Review Added Successfully');
        }
        this.isAddLoader = false;
        this.getReviews(1);
        this.productAddReviewForm.reset();
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isAddLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/'/g, "''");
      }
    }
    return obj;
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
