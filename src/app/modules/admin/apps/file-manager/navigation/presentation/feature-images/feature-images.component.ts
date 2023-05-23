import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
import { AddFeatureImage } from '../../../stores.types';
@Component({
  selector: 'app-feature-images',
  templateUrl: './feature-images.component.html',
  styles: ['.input-width {width: 48%}']
})
export class PresentationFeatureImagesComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  featureImagesData: any;
  featureImageUrl = "";
  addNewFeature: boolean = false;

  imgUrl = '';
  imgUrlMobile = '';
  mobileData: any = {
    imageURL: '',
    blnNewWindow: false,
    pk_mobileFeatureImageID: null
  };

  updateMobileLoader: boolean = false;
  updateMobileMsg: boolean = false;
  removeMobileLoader: boolean = false;
  removeMobileMsg: boolean = false;
  imageValue: any;
  mobileImageCheck: boolean = true;

  // Feature Image
  addfeatureImageForm: FormGroup;
  updateNewFeature: boolean = false;
  featureImageObj: any;
  addNewFeatureLoader: boolean = false;
  removeFeatureLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit() {
    this.initialize();
    this.getMobileData();
  }
  initialize() {
    this.addfeatureImageForm = new FormGroup({
      store_id: new FormControl(this.selectedStore.pk_storeID),
      buttonURL: new FormControl(''),
      displayOrder: new FormControl(1),
      blnNewWindow: new FormControl(false),
      headerCopy: new FormControl(''),
      buttonCopy: new FormControl(''),
      align: new FormControl(0),
      headerCopyColor: new FormControl(''),
      buttonBackgroundColor: new FormControl(''),
      buttonColor: new FormControl(''),
      arrowColor: new FormControl(''),
      imageURL: new FormControl(''),
      add_presentation_feature_image: new FormControl(true)
    })
    this.imgUrl = environment.storeMedia + '/featureImage/' + this.selectedStore.pk_storeID + '/';
    this.imgUrlMobile = environment.storeMedia + '/featureImage/mobile/' + this.selectedStore.pk_storeID + '/';
    this.featureImagesData = this.screenData;

  }
  addNewFeatureImageToggle() {
    this.addNewFeature = !this.addNewFeature;
    this.featureImageObj = null;
  }
  getMobileData() {
    let params = {
      presentation_static_mobile_feature_image: true,
      store_id: this.selectedStore.pk_storeID
    }
    this._storeManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        if (res.data.length > 0) {
          this.mobileData = res["data"][0];
          this.imgUrlMobile = environment.storeMedia + '/featureImage/mobile/' + this.selectedStore.pk_storeID + '/' + this.mobileData.pk_mobileFeatureImageID + '.jpg?' + Math.random();
        }

        this._changeDetectorRef.markForCheck();
      });
  }
  updateMobile() {
    let payload = {
      pk_mobileFeatureImageID: this.mobileData.pk_mobileFeatureImageID,
      blnNewWindow: this.mobileData.blnNewWindow,
      imageURL: this.mobileData.imageURL,
      update_static_mobile_image: true
    }
    this.updateMobileLoader = true;
    this._storeManagerService.EditStaticFeatureImage(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.updateMobileLoader = false;
      if (this.imageValue) {
        this.uploadMedia();
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateMobileLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addMobileStatic() {
    let params = {
      fk_storeID: this.selectedStore.pk_storeID,
      blnNewWindow: this.mobileData.blnNewWindow,
      imageURL: this.mobileData.imageURL,
      add_static_mobile_image: true
    }
    this.updateMobileLoader = true;
    this._storeManagerService.AddStaticFeatureImage(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.mobileData.pk_mobileFeatureImageID = res.feature_image_id;
      this.imgUrlMobile = environment.storeMedia + '/featureImage/mobile/' + this.selectedStore.pk_storeID + '/' + this.mobileData.pk_mobileFeatureImageID + '.jpg?' + Math.random();
      this.updateMobileLoader = false;
      if (this.imageValue) {
        this.uploadMedia();
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateMobileLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  removeMobileImage() {
    let params = {
      pk_mobileFeatureImageID: this.mobileData.pk_mobileFeatureImageID,
      delete_mobile_image: true
    }
    this.removeMobileLoader = true;
    this._storeManagerService.DeleteMobileImage(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.mobileImageCheck = false
      this._snackBar.open("Mobile static image removed successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      this.mobileData.pk_mobileFeatureImageID = null;
      this.mobileData.imageURL = '';
      this.mobileData.blnNewWindow = false;
      this.removeMobileLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.removeMobileLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  uploadFile(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 1242 || image.height != 450) {
          this._snackBar.open("Dimensions allowed are 1242px x 450px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.imageValue = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }
    }
  };
  uploadMedia() {
    let base64;
    const { imageUpload } = this.imageValue;
    base64 = imageUpload.split(",")[1];
    const img_path = `/globalAssets/Stores/featureImage/mobile/${this.selectedStore.pk_storeID}/${this.mobileData.pk_mobileFeatureImageID}.jpg`
    this.imgUrlMobile = environment.storeMedia + `/featureImage/mobile/${this.selectedStore.pk_storeID}/${this.mobileData.pk_mobileFeatureImageID}.jpg? ${Math.random()}`;

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.imageValue = null;
        this.mobileImageCheck = true;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  EditFeatureImage(obj) {
    this.addNewFeature = true;
    this.updateNewFeature = true;
    obj.headerCopyColor = '#' + obj.headerCopyColor;
    obj.buttonColor = '#' + obj.buttonColor;
    obj.buttonBackgroundColor = '#' + obj.buttonBackgroundColor;
    obj.arrowColor = '#' + obj.arrowColor;
    this.featureImageObj = obj;
    this.addfeatureImageForm.patchValue(obj);
  }
  AddFeatureImage() {
    if (!this.imageValue) {
      this._snackBar.open("Feature image is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.addNewFeatureLoader = true;
    const { buttonURL, displayOrder, blnNewWindow, headerCopy, buttonCopy, align, headerCopyColor, buttonBackgroundColor, buttonColor, arrowColor, imageURL, add_presentation_feature_image, store_id } = this.addfeatureImageForm.getRawValue();
    let payload = {
      store_id, buttonURL, displayOrder, blnNewWindow, headerCopy: headerCopyColor.replace('#', ''), buttonCopy, align, headerCopyColor: headerCopyColor.replace('#', ''), buttonBackgroundColor: buttonBackgroundColor.replace('#', ''), buttonColor: buttonColor.replace('#', ''), arrowColor: arrowColor.replace('#', ''), imageURL, add_presentation_feature_image
    }
    this._storeManagerService.AddFeatureImage(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.uploadFeatureMedia(res.feature_image_id, 'add');
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.addNewFeatureLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  UpdateFeatureImage() {
    this.addNewFeatureLoader = true;
    const { buttonURL, displayOrder, blnNewWindow, headerCopy, buttonCopy, align, headerCopyColor, buttonBackgroundColor, buttonColor, arrowColor, imageURL } = this.addfeatureImageForm.getRawValue();
    let payload = {
      pk_featureImageID: this.featureImageObj.pk_featureImageID,
      buttonURL,
      displayOrder,
      blnNewWindow,
      headerCopy,
      buttonCopy,
      align,
      headerCopyColor: headerCopyColor.replace('#', ''),
      buttonBackgroundColor: buttonBackgroundColor.replace('#', ''),
      buttonColor: buttonColor.replace('#', ''),
      arrowColor: arrowColor.replace('#', ''),
      imageURL,
      blnActive: this.featureImageObj.blnActive,
      update_presentation_feature_image: true
    }
    this._storeManagerService.UpdateFeatureImage(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      // this.addNewFeatureLoader = false;
      this.featureImagesData.filter(item => {
        if (item.pk_featureImageID == this.featureImageObj.pk_featureImageID) {
          item.buttonURL = buttonURL;
          item.displayOrder = displayOrder;
          item.blnNewWindow = blnNewWindow;
          item.headerCopy = headerCopy;
          item.buttonCopy = buttonCopy;
          item.align = align;
          item.headerCopyColor = headerCopyColor.replace('#', '');
          item.buttonBackgroundColor = buttonBackgroundColor.replace('#', '');
          item.buttonColor = buttonColor.replace('#', '');
          item.arrowColor = arrowColor.replace('#', '');
          item.imageURL = imageURL;
          item.blnActive = this.featureImageObj.blnActive;
        }
      })
      this.screenData.filter(item => {
        if (item.pk_featureImageID == this.featureImageObj.pk_featureImageID) {
          item.buttonURL = buttonURL;
          item.displayOrder = displayOrder;
          item.blnNewWindow = blnNewWindow;
          item.headerCopy = headerCopy;
          item.buttonCopy = buttonCopy;
          item.align = align;
          item.headerCopyColor = headerCopyColor.replace('#', '');
          item.buttonBackgroundColor = buttonBackgroundColor.replace('#', '');
          item.buttonColor = buttonColor.replace('#', '');
          item.arrowColor = arrowColor.replace('#', '');
          item.imageURL = imageURL;
          item.blnActive = this.featureImageObj.blnActive;
        }
      })
      if (this.imageValue) {
        this.uploadFeatureMedia(this.featureImageObj.pk_featureImageID, 'update');
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.addNewFeatureLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  removeFeatureImage() {
    this.removeFeatureLoader = true;
    let payload = {
      pk_featureImageID: this.featureImageObj.pk_featureImageID,
      delete_presentation_feature_image: true
    }
    this._storeManagerService.DeleteFeatureImage(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      this.featureImagesData = this.featureImagesData.filter(item => item.pk_featureImageID != this.featureImageObj.pk_featureImageID);
      this.removeFeatureLoader = false;
      this._snackBar.open("Feature image removed successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this.addNewFeature = false;

      this._changeDetectorRef.markForCheck();
    }, err => {
      this.removeFeatureLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  uploadFeatureFile(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 1500 || image.height != 300) {
          this._snackBar.open("Dimensions allowed are 1500px x 300px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.imageValue = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }
    }
  };
  uploadFeatureMedia(id, type) {
    let base64;
    const { imageUpload } = this.imageValue;
    base64 = imageUpload.split(",")[1];
    const img_path = `/globalAssets/Stores/featureImage/${this.selectedStore.pk_storeID}/${id}.jpg`;

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.getFeatureMedia(type);
        this.imageValue = null;
        this.mobileImageCheck = true;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  getFeatureMedia(type) {
    let params = {
      presentation: true,
      store_id: this.selectedStore.pk_storeID,
      presentation_feature_image: true,
    }
    this._storeManagerService.getPresentationData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (type != 'remove') {
        this.addNewFeatureLoader = false;
        this._snackBar.open("Feature image updated successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
      }
      this.featureImagesData = res.data;
      this.addNewFeature = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.addNewFeatureLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  cancelUpdateFeature() {
    this.updateNewFeature = false;
  }
  checkImageExist() {
    this.mobileImageCheck = false;
  }
  random() {
    return Math.random();
  }
}
