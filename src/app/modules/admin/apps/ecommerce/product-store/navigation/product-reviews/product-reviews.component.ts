import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreProductService } from '../../store.service';
import { AddReview, DeleteReview, UpdateReview } from '../../store.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';

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
  @ViewChild('fileInputImage') fileInputImage: ElementRef;


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
  imageUploadLoader: boolean = false;


  productViewLoader: boolean = false;
  fileName: string = "";
  imagesArray = [];
  images: any;
  imageError = "";
  isImageExists: boolean = false;

  productReviewForm: FormGroup;

  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _storeService: StoreProductService,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.productAddReviewForm = new FormGroup({
      name: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      date: new FormControl(moment().format("MM/DD/YYYY")),
      rating: new FormControl(1, Validators.required),
      comment: new FormControl('')
    });
    this.updateProductReviewForm = new FormGroup({
      pk_reviewID: new FormControl('', Validators.required),
      blnActive: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      company: new FormControl('', Validators.required),
      FormattedDate: new FormControl(),
      rating: new FormControl(1, Validators.required),
      comment: new FormControl(''),
      response: new FormControl('')
    });
    this.productReviewForm = new FormGroup({
      name: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      recipients: new FormControl('', Validators.required),
      message: new FormControl(''),
    });
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
    if (value == 'Send Product Review') {
      const userData = JSON.parse(localStorage.getItem('userDetails'));
      this.productReviewForm.patchValue({
        name: userData.firstName + ' ' + userData.lastName,
        subject: userData.firstName + ' ' + userData.lastName + ' from ' + this.selectedProduct.storeName + ' Would Like You To Review This Product'
      })
    }
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
    const { name, FormattedDate, rating, comment, response, blnActive, pk_reviewID } = this.updateProductReviewForm.getRawValue();

    if (name.trim() === '') {
      this._storeService.snackBar('Please fill all required fields');
      return;
    }
    if (!FormattedDate) {
      this._storeService.snackBar('Please fill all required fields');
      return;
    }

    let payload: UpdateReview = {
      name: name.trim(),
      date: FormattedDate,
      rating,
      comment: comment.trim(),
      response: response,
      blnActive,
      pk_reviewID,
      storeProductId:
        this.editData.fk_storeProductID,
      update_review: true
    };
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isUpdateLoader = true;
    this._storeService.putStoresData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload))
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((responses: any) => {
        if (responses["success"] === true) {
          this._storeService.snackBar('Review Updated Successfully');
        }
        this.isUpdateLoader = false;
        this.editData.name = name;
        this.editData.FormattedDate = FormattedDate;
        this.editData.date = FormattedDate;
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
      storeProductId: this.selectedProduct.pk_storeProductID,
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

  upload(event) {
    const file = event.target.files[0];
    this.fileName = !this.imagesArray.length ? "1" : `${this.imagesArray.length + 1}`;
    let fileType = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.images = {
        imageUpload: reader.result,
        fileType: fileType
      };
    };
  };

  checkImageExist() {
    const { pk_storeProductID } = this.selectedProduct;
    const url = `${environment.assetsURL}/globalAssets/Products/HiRes/${pk_storeProductID}.jpg`
    const img = new Image();
    img.src = url;
    img.onload = () => {
      this.isImageExists = true;
      this._changeDetectorRef.markForCheck();
    };
    img.onerror = () => {
      this.isImageExists = false;
      this._changeDetectorRef.markForCheck();
    };
  }


  sendProductReview() {
    const { name, subject, recipients, message } = this.productReviewForm.getRawValue();

    if (name.trim() === '' || subject.trim() === '' || recipients.trim() === '') {
      this._storeService.snackBar('Please fill all required fields');
      return;
    }
    this.checkImageExist();

    const { pk_storeProductID } = this.selectedProduct;
    let payload = {
      name: name.trim(),
      subject: subject.trim(),
      recipients: recipients.trim().split(','),
      message: message.trim(),
      storeProductID: this.selectedProduct.pk_storeProductID,
      storeID: this.selectedProduct.fk_storeID,
      storeName: this.selectedProduct.storeName,
      imagePath: this.isImageExists ? `${environment.assetsURL}/globalAssets/Products/HiRes/${pk_storeProductID}.jpg` : 'https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg',
      primaryHighlight: this.selectedProduct.primaryHighlight,
      protocol: this.selectedProduct.protocol,
      storeURL: this.selectedProduct.storeURL,
      storeCode: this.selectedProduct.storeCode,
      pk_storeProductID: this.selectedProduct.pk_storeProductID,
      productName: this.selectedProduct.productName,
      send_product_review: true
    };
    this.productViewLoader = true;

    this._storeService.postStoresProductsData(this.replaceSingleQuotesWithDoubleSingleQuotes(payload))
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (response["success"] === true) {
          this._storeService.snackBar('Review Send Successfully');
        }
        this.productViewLoader = false;
        this.productAddReviewForm.reset();
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.productViewLoader = false;
        this._changeDetectorRef.markForCheck();
      })

  }

  // uploadImage(): void {
  //   this.imageError = null;

  //   //to be moved into upper function

  //   // if (!this.images) {
  //   //   this._snackBar.open("Please attach an image", '', {
  //   //     horizontalPosition: 'center',
  //   //     verticalPosition: 'bottom',
  //   //     duration: 3500
  //   //   });
  //   //   this.fileInputImage.nativeElement.value = '';
  //   //   return;
  //   // };

  //   let image = new Image;
  //   const { imageUpload, fileType } = this.images;
  //   image.src = imageUpload;
  //   image.onload = () => {
  //     if (fileType != "image/jpeg") {
  //       this._snackBar.open("Image extensions are allowed in JPG", '', {
  //         horizontalPosition: 'center',
  //         verticalPosition: 'bottom',
  //         duration: 3500
  //       });
  //       this.images = null;
  //       this.fileInputImage.nativeElement.value = '';
  //       return;
  //     };

  //     if (image.width != 600 || image.height != 600) {
  //       this._snackBar.open("Dimentions allowed are 600px x 600px", '', {
  //         horizontalPosition: 'center',
  //         verticalPosition: 'bottom',
  //         duration: 3500
  //       });
  //       this.fileInputImage.nativeElement.value = '';
  //       this.images = null;
  //       return;
  //     };

  //     const { pk_productID } = this.selectedProduct;
  //     const base64 = imageUpload.split(",")[1];
  //     const payload = {
  //       file_upload: true,
  //       image_file: base64,
  //       image_path: `/globalAssets/Products/Swatch/${pk_productID}/${pk_productID}.jpg`
  //     };

  //     this.imageUploadLoader = true;
  //     this._inventoryService.addSwatchImage(payload)
  //       .subscribe((response) => {
  //         this._snackBar.open(response["message"], '', {
  //           horizontalPosition: 'center',
  //           verticalPosition: 'bottom',
  //           duration: 3500
  //         });
  //         this.imageUploadLoader = false;
  //         this.imagesArray.pop();
  //         const temp = Math.random();
  //         this.imagesArray.push(`${environment.productMedia}/Swatch/${pk_productID}/${pk_productID}.jpg?${temp}`);

  //         this.images = null;
  //         this.fileInputImage.nativeElement.value = '';
  //         // Mark for check
  //         this._changeDetectorRef.markForCheck();
  //       }, err => {
  //         this.imageUploadLoader = false;
  //         this._snackBar.open("Some error occured", '', {
  //           horizontalPosition: 'center',
  //           verticalPosition: 'bottom',
  //           duration: 3500
  //         });

  //         this.fileInputImage.nativeElement.value = '';
  //         // Mark for check
  //         this._changeDetectorRef.markForCheck();
  //       })
  //   };
  // };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
}
