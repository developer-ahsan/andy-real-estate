import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
@Component({
  selector: 'app-customer-reviews',
  templateUrl: './customer-reviews.component.html'
})
export class CustomerReviewsComponent implements OnInit {

  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['spid', 'products', 'supplier', 'reviews'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;

  keywordSearch: string = "";
  isKeywordSearch: boolean = false;

  isEditReview: boolean = false;
  isAddReview: boolean = false;
  editData: any;
  productReviewForm: FormGroup;
  productAddReviewForm: FormGroup;

  isEditPageLoader: boolean = false;
  productReviewsData: any;
  isUpdatePageLoader: boolean = false;

  flashMessage: boolean = false;
  flashMessage1: boolean = false;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.dataSourceLoading = true;
    this.getCustomerReviews(1);
    this.isLoadingChange.emit(false);
  };
  initialize() {
    this.productReviewForm = this.fb.group({
      reviews: new FormArray([])
    });
    this.productAddReviewForm = new FormGroup({
      name: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      date: new FormControl(moment().format("MM/DD/YYYY")),
      rating: new FormControl(1, Validators.required),
      comment: new FormControl('')
    })
  }
  get reviewListArray(): FormArray {
    return this.productReviewForm.get('reviews') as FormArray;
  }
  getCustomerReviews(page) {
    let params = {
      customer_reviews: true,
      store_id: this.selectedStore.pk_storeID,
      page: page,
      size: 20
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.dataSource = response["data"];
        if (page == 1) {
          this.dataSourceLoading = false;
          this.dataSourceTotalRecord = response["totalRecords"];
        }

        this._changeDetectorRef.markForCheck();
      }, err => {
        this.dataSourceLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  getCustomerReviewsByID(product) {
    this.initialize();
    this.editData = product;
    this.isEditPageLoader = true;
    this.isEditReview = true;
    let params = {
      review_details: true,
      store_product_id: product.pk_storeProductID
    }
    this._fileManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.productReviewsData = response["data"];
        for (let i = 0; i < response["data"].length; i++) {
          this.reviewListArray.push(this.fb.group({
            name: new FormControl(this.productReviewsData[i].name, [Validators.required]),
            date: new FormControl(moment(this.productReviewsData[i].date).format('YYYY-MM-DD'), [Validators.required]),
            rating: new FormControl(this.productReviewsData[i].rating, [Validators.required]),
            comment: new FormControl(this.productReviewsData[i].comment, [Validators.required]),
            response: new FormControl(this.productReviewsData[i].response),
            image: new FormControl(''),
            pk_reviewID: new FormControl(this.productReviewsData[i].pk_reviewID),
            storeProductId: new FormControl(this.productReviewsData[i].fk_storeProductID),
            update_review: new FormControl(true),
            loader: new FormControl(false),
            flashMessage: new FormControl(false),
            blnActive: new FormControl(this.productReviewsData[i].blnActive, [Validators.required])
          }));
        }
        this.isEditPageLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isEditPageLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  getNextData(event) {
    const { previousPageIndex, pageIndex } = event;

    if (pageIndex > previousPageIndex) {
      this.page++;
    } else {
      this.page--;
    };
    this.getCustomerReviews(this.page);
  };
  removeReviews(index): void {
    this.reviewListArray.removeAt(index);
  }

  editToggle(data) {
    this.editData = data;
    this.isEditReview = !this.isEditReview;
  }
  backToReviews() {
    this.isEditReview = false;
    this.isAddReview = false;
  }
  backToUpdateReviews() {
    this.isEditReview = true;
    this.isAddReview = false;
  }
  addReviewToggle() {
    this.productAddReviewForm.patchValue({
      storeProductId: this.editData.pk_storeProductID
    });
    this.isEditReview = false;
    this.isAddReview = true;
  }
  upload(event, element) {
    const { fk_colorID } = element;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const image = String(reader.result).split(",")[1];
      element.patchValue({
        image: image
      })
      console.log(element.value);
    };
  };
  updateProductReview(element) {
    element.patchValue({
      loader: true
    })
    let payload = element.value;
    this._fileManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (response["success"] === true) {
          element.patchValue({
            flashMessage: true
          })
        }
        setTimeout(() => {
          element.patchValue({
            flashMessage: false
          })
          this._changeDetectorRef.markForCheck();
        }, 2000);
        element.patchValue({
          loader: false
        })
        this._changeDetectorRef.markForCheck();
      }, err => {
        element.patchValue({
          loader: false,
          flashMessage: false
        })
        this._changeDetectorRef.markForCheck();
      })
  }
  addProductReview() {
    this.flashMessage1 = true;
    const { name, company, date, rating, comment } = this.productAddReviewForm.getRawValue();
    let payload = {
      storeProductId: this.editData.pk_storeProductID,
      name: name + '-' + company, company, date, rating, comment,
      add_review: true
    };
    this._fileManagerService.postStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.flashMessage1 = false;
        if (response["success"]) {
          this.productAddReviewForm.reset();
          this.flashMessage = true;
          setTimeout(() => {
            this.flashMessage = false;
            this._changeDetectorRef.markForCheck();
          }, 3000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {

        this.flashMessage1 = false;
        this._changeDetectorRef.markForCheck();
      })
  }
}