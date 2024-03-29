import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, Directive, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/store-manager.service';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-customer-reviews',
  templateUrl: './customer-reviews.component.html'
})
export class CustomerReviewsComponent implements OnInit, OnDestroy {
  @Directive({ selector: '[myHighlight]' })
  @ViewChild('myHighlight') myHighlight: ElementRef;

  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['spid', 'products', 'supplier', 'reviews'];
  dataSource = [];
  duplicatedDataSource = [];
  dataSourceTotalRecord: number;
  dataSourceLoading = false;
  page: number = 1;
  pageInformation: any;

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

  isAddLoader: boolean = false;
  mainScreen = 'Product Reviews';
  targetdStore = 0;
  allActiveStores = [];
  exportLoader: boolean = false;
  randomString = Math.random();
  constructor(
    private _storeManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private el: ElementRef,
    private _authService: AuthService,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
    this.getAllActiveStores();
  };
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.dataSourceLoading = true;
        this.initialize();
        this.dataSourceLoading = true;
        this.getCustomerReviews(1);
      });
  }
  getAllActiveStores() {
    this._commonService.storesData$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allActiveStores.push({ storeName: 'Select a store', pk_storeID: 0 });
      res["data"].forEach(element => {
        if (element.blnActive) {
          this.allActiveStores.push(element);
        }
      });
    });
  }
  exportReviews() {
    if (this.targetdStore == 0) {
      this._storeManagerService.snackBar('Please select a store');
      return;
    }
    let payload = {
      source_store_id: this.selectedStore.pk_storeID,
      target_store_id: this.targetdStore,
      export_review: true
    }
    this.exportLoader = true;
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this._storeManagerService.snackBar(res["message"]);
      }
      this.exportLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
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
    const userData = JSON.parse(localStorage.getItem('userDetails'));
    this.sendProductReviewForm.patchValue({
      name: userData.firstName + ' ' + userData.lastName,
      subject: userData.firstName + ' ' + userData.lastName + ' from ' + this.selectedStore.storeName + ' Would Like You To Review This Product'
    })
  }
  get reviewListArray(): FormArray {
    return this.productReviewForm.get('reviews') as FormArray;
  }
  calledScreen(screen) {
    this.mainScreen = screen;
  }
  getCustomerReviews(page) {
    let params = {
      customer_reviews: true,
      store_id: this.selectedStore.pk_storeID,
      page: page,
      size: 20
    }
    this.dataSourceLoading = true;
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.pageInformation = response;
        this.dataSource = response["data"];
        if (page == 1) {
          this.dataSourceTotalRecord = response["totalRecords"];
        }
        this.dataSourceLoading = false;


        this._changeDetectorRef.markForCheck();
      }, err => {
        this.dataSourceLoading = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  getCustomerReviewsByID(product) {
    this.randomString = Math.random();
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
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        response["data"].forEach(element => {
          this.getReviewImages(element);
        });
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
          this.isAddLoader = false;
          this._changeDetectorRef.markForCheck();
        }

        this.isEditPageLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isEditPageLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  getReviewImages(review) {
    let payload = {
      files_fetch: true,
      path: `globalAssets/StoreProducts/reviewImages/${review.pk_reviewID}`
    };
    this._commonService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      review.reviewImages = res["data"];
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
    this._storeManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res["success"]) {
          this.reviewListArray.removeAt(index);
          this._snackBar.open("Review Deleted Successfully", '', {
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
    element.inputElement = event.target;
    const image = element.inputElement.files[0]

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if ((image.width >= 600 && image.height >= 600) && (image.width <= 1500 && image.height <= 1500)) {
          if (file["type"] != 'image/jpeg' && file["type"] != 'image/jpg') {
            this._storeManagerService.snackBar("Image should be jpg format only");
            element.patchValue({
              image: null
            });
            element.inputElement.value = '';
            this._changeDetectorRef.markForCheck();
            return;
          } else {
            element.patchValue({
              image: reader.result
            })
          }
        } else {
          this._storeManagerService.snackBar("Dimensions allowed between 600 x 600 minimum, 1500 x 1500 maximum.");
          element.patchValue({
            image: null
          })
          element.inputElement.value = '';
          this._changeDetectorRef.markForCheck();
        }
      }
    }
  };

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/'/g, "''");
      }
    }
    return obj;
  }


  updateProductReview(element, reviewsData) {
    if (element.value.name.trim() === '' || element.value.comment.trim() === '') {
      this._snackBar.open("Please fill the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    element.patchValue({
      loader: true
    })
    let payload = element.value;
    payload = this.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    // Remove Media
    this.removeReviewMedia(reviewsData);
    // Upload Media
    if (element.value.image) {
      this.uploadReviewMedia(element, reviewsData);
    }
    this._storeManagerService.putStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (response["success"]) {
          this._storeManagerService.snackBar(response["message"]);
          this.getCustomerReviewsByID(this.editData);
        }
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

  removeReviewMedia(reviewsData) {
    let images = [];
    reviewsData.reviewImages.forEach(image => {
      if (image.delCheck) {
        images.push(`/globalAssets/StoreProducts/reviewImages/${reviewsData.pk_reviewID}/${image.FILENAME}`)
      }
    });
    if (images.length) {
      let payload = {
        files: images,
        delete_multiple_files: true
      }
      this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {

      });
    }

  }
  uploadReviewMedia(element, reviewsData) {
    let base64;
    base64 = element.value.image.split(",")[1];
    const img_path = `/globalAssets/StoreProducts/reviewImages/${reviewsData.pk_reviewID}/${Math.random()}.jpg`;

    const files = [{
      image_file: base64,
      image_path: img_path
    }]

    this._commonService.uploadMultipleMediaFiles(files).subscribe(res => {
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }


  addProductReview() {
    const { name, company, date, rating, comment } = this.productAddReviewForm.getRawValue();
    if (name.trim() == '' || company.trim() === '') {
      this._snackBar.open("Please fill the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    let payload = {
      storeProductId: this.editData.pk_storeProductID,
      name: name + '-' + company, company, date, rating, comment,
      add_review: true
    };
    payload = this.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isAddLoader = true;
    this.flashMessage1 = true;
    this._storeManagerService.postStoresData(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (response["success"]) {
          this.getCustomerReviewsByID(this.editData);
          this.flashMessage = true;
        }
        this._changeDetectorRef.markForCheck();
      }, err => {

        this.isAddLoader = false;
        this.flashMessage1 = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  sendProductReviewEmail() {
    let myCurrentContent: string = this.myHighlight.nativeElement.innerHTML;
    let html = '<!DOCTYPE html>' + myCurrentContent;
    this.sendProductReviewForm.patchValue({
      html_body: html,
      store_name: this.selectedStore.storeName
    })
    const { email_list, subject, store_name, html_body, send_review_email } = this.sendProductReviewForm.getRawValue();
    let emails = email_list.split(",");
    if (emails.length == 0) {
      this._storeManagerService.snackBar('Email is required');
      return;
    }
    let payload = {
      email_list: emails, subject, store_name, html_body, send_review_email
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isSendProductReviewLoader = true;
    this._storeManagerService.postStoresData(payload)
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}