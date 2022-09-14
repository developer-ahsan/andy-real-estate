import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, Directive, ElementRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
@Component({
  selector: 'app-customer-reviews',
  templateUrl: './customer-reviews.component.html'
})
export class CustomerReviewsComponent implements OnInit {
  @Directive({ selector: '[myHighlight]' })
  @ViewChild('myHighlight') myHighlight: ElementRef;

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

  isSendProductReview: boolean = false;
  sendProductReviewForm: FormGroup;
  isSendProductReviewLoader: boolean = false;
  isSendProductReviewMsg: boolean = false;


  flashMessage: boolean = false;
  flashMessage1: boolean = false;
  user: any;

  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private el: ElementRef,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initialize();
    this.dataSourceLoading = true;
    this.getCustomerReviews(1);
    this.isLoadingChange.emit(false);
  };
  initialize() {
    this.user = this._authService.parseJwt(this._authService.accessToken);
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
    this.sendProductReviewForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email_list: new FormControl([], Validators.required),
      subject: new FormControl(this.user.name + ' ' + this.selectedStore.storeName + ' Would Like You To Review This Product', Validators.required),
      html_body: new FormControl(''),
      message: new FormControl(''),
      store_name: new FormControl(''),
      send_review_email: new FormControl(true)
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
    if (!this.flashMessage1) {
      this.isEditPageLoader = true;
      this.isEditReview = true;
    }
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
            del_loader: new FormControl(false),
            flashMessage: new FormControl(false),
            blnActive: new FormControl(this.productReviewsData[i].blnActive, [Validators.required])
          }));
        }
        if (this.flashMessage1) {
          this.flashMessage1 = false;
          this.isEditReview = true;
          this.flashMessage = false;
          this.isAddReview = false;
          this._changeDetectorRef.markForCheck();
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
  removeReviews(index, element): void {
    element.patchValue({
      del_loader: true
    })
    let payload = {
      pk_reviewID: element.get('pk_reviewID').value,
      delete_review: true
    }
    this._fileManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          this.reviewListArray.removeAt(index);
          this._snackBar.open("Review Deleted Successfully!!", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3000
          });
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        element.patchValue({
          del_loader: false
        })
        this._changeDetectorRef.markForCheck()
      })
    // this.reviewListArray.removeAt(index);
  }

  editToggle(data) {
    this.editData = data;
    this.isEditReview = !this.isEditReview;
  }
  editsendProductToggle() {
    this.isEditReview = false;
    this.isSendProductReview = true;
  }
  backToReviews() {
    this.isEditReview = false;
    this.isAddReview = false;
    this.isSendProductReview = false;
  }
  backToUpdateReviews() {
    this.isEditReview = true;
    this.isSendProductReview = false;
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
        if (response["success"]) {
          this.getCustomerReviewsByID(this.editData);
          this.flashMessage = true;
        }
        this._changeDetectorRef.markForCheck();
      }, err => {

        this.flashMessage1 = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  sendProductReviewEmail() {
    this.isSendProductReviewLoader = true;
    let myCurrentContent: string = this.myHighlight.nativeElement.innerHTML;
    let html = '<!DOCTYPE html>' + myCurrentContent;
    this.sendProductReviewForm.patchValue({
      html_body: html,
      store_name: this.selectedStore.storeName
    })
    const { email_list, subject, store_name, html_body, send_review_email } = this.sendProductReviewForm.getRawValue();
    let emails = email_list.split(",");
    let payload = {
      email_list: emails, subject, store_name, html_body, send_review_email
    }
    this._fileManagerService.postStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        // if (response["success"]) {
        this.isSendProductReviewLoader = false;
        this.isSendProductReviewMsg = true;
        setTimeout(() => {
          this.isSendProductReviewMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 2000);
        this.sendProductReviewForm = new FormGroup({
          name: new FormControl('', Validators.required),
          email_list: new FormControl([], Validators.required),
          subject: new FormControl(this.user.name + ' ' + this.selectedStore.storeName + ' Would Like You To Review This Product', Validators.required),
          html_body: new FormControl(''),
          message: new FormControl(''),
          store_name: new FormControl(''),
          send_review_email: new FormControl(true)
        })
        // }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isSendProductReviewLoader = false;
        this.isSendProductReviewMsg = false;
        this._changeDetectorRef.markForCheck();
      })

  }
}