import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../../store-manager.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
@Component({
  selector: 'app-quick-guides',
  templateUrl: './quick-guides.component.html',
})
export class PresentationQuickGuidesComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() screenData: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  specialOfferForm: FormGroup;
  updateLoader: boolean = false;
  specialOfferMsg: boolean = false;

  quickGuides = {
    screens: ['Quick Guide Header', 'New Quick Guide', 'Current Quick Guides'],
    mainScreen: 'Quick Guide Header'
  }
  imageValue: any;
  masHeadLoader: boolean = false;
  quickGuideImage = '';
  quickGuideCheck: boolean = true;
  quickGuideImageLoader: boolean = false;
  QuickimageValue: any;
  quickGuideName = '';
  quickGuidePDF: any;
  addQuickGuideLoader: boolean = false;
  quickMediaId;
  constructor(
    private _storeManagerService: FileManagerService,
    private _snackBar: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
    private _commonService: DashboardsService,

  ) { }


  ngOnInit() {
    this.initialize();
  }
  initialize() {
    this.quickGuideImage = environment.storeMedia + `/quickGuides/headers/` + this.selectedStore.pk_storeID + ".jpg?" + Math.random();
  }
  openPdf(id) {
    const url = environment.storeMedia + `/quickGuides/${this.selectedStore.pk_storeID}/${id}.pdf`;
    window.open(url, '_blank');
  }
  calledScreenQuickGuide(screenName) {
    this.quickGuides.mainScreen = screenName;
  }
  removeQuickGuides(item) {
    item.loader = true;
    let paylaod = {
      remove_quick_guide: true,
      pk_quickGuideID: item.pk_quickGuideID
    }
    this._storeManagerService.RemoveQuickGuide(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      item.loader = false;
      this.screenData = this.screenData.filter(element => element.pk_quickGuideID != item.pk_quickGuideID);
      this._snackBar.open("Quick guide removed successfully", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.loader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  addQuickGuides() {
    if (!this.quickGuideName) {
      this._snackBar.open("Please fill out the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    if (!this.quickGuidePDF) {
      this._snackBar.open("PDF file is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3500
      });
      return;
    }
    this.addQuickGuideLoader = true;
    let paylaod = {
      fk_storeID: this.selectedStore.pk_storeID,
      add_quick_guide: true,
      name: this.quickGuideName
    }
    this._storeManagerService.AddQuickGuide(paylaod).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quickMediaId = res["quickMediaId"];
      this.uploadQuickMediaCampaign('pdf');
      this.getQuickGuides();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.addQuickGuideLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  getQuickGuides() {
    let params = {
      presentation: true,
      store_id: this.selectedStore.pk_storeID,
      quickGuides_presentation: true,
    };
    this._storeManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        this._snackBar.open("Quick guide added successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.addQuickGuideLoader = false;
        this.quickGuideName = '';
        this.quickGuides.mainScreen = 'Current Quick Guides';
        this.screenData = res.data;
        this._changeDetectorRef.markForCheck();
      });
  }
  CheckQuickGuideImage(image) {
    this.quickGuideCheck = false;
  }
  uploadQuickImage(event, type): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (type == 'image') {
        let image: any = new Image;
        image.src = reader.result;
        image.onload = () => {
          if (image.width != 1500 || image.height != 300) {
            this._snackBar.open("Dimensions allowed are 1500px x 300px", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.QuickimageValue = null;
            this._changeDetectorRef.markForCheck();
            return;
          };
          this.QuickimageValue = {
            imageUpload: reader.result,
            type: file["type"]
          };
        }
      } else {
        this.quickGuidePDF = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }

    };
  };
  uploadQuickMediaCampaign(check) {
    let payload;
    if (check == 'image') {
      if (!this.QuickimageValue) {
        this._snackBar.open("File is required", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        return;
      }
      this.quickGuideImageLoader = true;
      const { imageUpload, type } = this.QuickimageValue;
      const base64 = imageUpload.split(",")[1];
      payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Stores/quickGuides/headers/${this.selectedStore.pk_storeID}.jpg`
      };
    } else {
      if (!this.quickGuidePDF) {
        this._snackBar.open("File is required", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        return;
      }
      this.quickGuideImageLoader = true;
      const { imageUpload, type } = this.quickGuidePDF;
      const base64 = imageUpload.split(",")[1];
      payload = {
        file_upload: true,
        image_file: base64,
        image_path: `/globalAssets/Stores/quickGuides/${this.selectedStore.pk_storeID}/${this.quickMediaId}.pdf`
      };
    }

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        if (check == 'image') {
          this.quickGuideImage = environment.storeMedia + `/quickGuides/headers/` + this.selectedStore.pk_storeID + ".jpg?" + Math.random();
          this.quickGuideCheck = true;
          this.quickGuideImageLoader = false;
        } else {
          this.quickGuidePDF = null;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.quickGuideImageLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }


  removeImage() {
    let payload = {
      files: [`/globalAssets/Stores/quickGuides/headers/${this.selectedStore.pk_storeID}.jpg`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this._storeManagerService.snackBar('Image Removed Successfully');
        this.quickGuideCheck = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._changeDetectorRef.markForCheck();
      })
  }

}
