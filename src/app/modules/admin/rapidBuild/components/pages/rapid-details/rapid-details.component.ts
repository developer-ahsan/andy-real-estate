import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RapidBuildService } from '../../rapid-build.service';
import { removeRapidBuildEntry, sendAutoRequest, UpdateArtworkTgas, updateProof, UpdateQuoteOptions, updateQuotePurchaseOrderComment, updateReorderNumber, updateStatus, uploadProof } from '../../rapid-build.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { environment } from 'environments/environment';


@Component({
  selector: 'app-rapid-details',
  templateUrl: './rapid-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./rapid-details.scss']
})
export class RapidBuildDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  dataSource = [];
  tempDataSource = [];
  displayedColumns: string[] = ['check', 'date', 'inhands', 'order', 'line', 'customer', 'product', 'supplier', 'status', 'store', 'proof', 'action'];
  totalRecords = 0;
  tempRecords = 0;
  page = 1;


  // Search Stores
  allStores = [];
  searchStoreCtrl = new FormControl();
  selectedStore: any;
  isSearchingStore = false;
  // Search Designers
  allDesigners = [];
  searchDesignerCtrl = new FormControl();
  selectedDesigner: any;
  isSearchingDesigner = false;
  // Search Filters
  ngSearchStore = '';
  ngSearchDesigner = '';
  ngFilterField = '2';
  ngFilterProduct = '';
  isFilterLoader: boolean = false;


  // Comment Toggle
  isCommentToggle: boolean = false;

  // loader
  isDetailLoader: boolean = false;

  // Order Details
  quoteData: any;
  quoteImprintdata: any;
  paramData: any;

  // Last Proof
  lastProofLoader: boolean = false;
  lastProofData: any;

  // User Details
  userData: any;
  // Comment
  ngComment = '';
  allColors: any;
  selectedImprint: any;
  selectedProofImprint: any;
  selectedImprintColor = '';
  selectedMultipleColors: any;
  // Artwork templates
  artWorkLoader: boolean = false;
  artworktemplatesData: any = [];
  // artwork tags
  artworktags: any = [];
  selectedMultipleTags: any;
  // Approval History
  approvalHistoryData: any;
  // Purchase Comments
  selectedPurchaseImprint: any;
  // Timer
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;

  // Updates
  updateQuoteInfoLoader: boolean = false;
  isPurchaseCommentLoader: boolean = false;
  isArtworkTagsLoader: boolean = false;
  isAutoRequestLoader: boolean = false;
  isManualProofLoader: boolean = false;

  allStatus: any;
  buildDetails: any;
  imprintDetails: any;
  artWorkDetails: any;
  colorsData: any;
  logoData: any;
  isLogoBankLoader: boolean = false;
  isRemoveLoader: boolean;
  isUpdateLoader: boolean;

  ngStatus = 0;
  ngProofCheck = true;
  storeProductImage = true;
  imageValue: any;
  ngProofComment: any;
  isUploadProofLoader: boolean = false;

  brandGuideExist: boolean = false;
  date = new Date().toLocaleString();
  params: any;
  @ViewChild('fileInput') fileInput: ElementRef;
  removeProofLoader: boolean;

  assetsUrl = environment.assetsURL;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _rapidService: RapidBuildService,
    private router: Router,
    private _activeRoute: ActivatedRoute,
    private _commonService: DashboardsService
  ) {

  }

  ngOnInit(): void {
    this.userData = JSON.parse(sessionStorage.getItem('rapidBuild'));
    this._activeRoute.params.subscribe(res => {
      this.isLoading = true;
      this.params = res;
      this.getRapidBuildDetails(res.id, res.store);
    });
    this._rapidService.rapidBuildStatuses$.pipe(takeUntil(this._unsubscribeAll)).subscribe(statuses => {
      this.allStatus = statuses['data'];
    });
  };
  getRapidBuildDetails(rbid, store) {
    let params = {
      rbid: rbid,
      store_id: Number(store),
      rapidbuild_details: true
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.buildDetails = res["data"][0];
      if (this.buildDetails) {
        if (this.buildDetails.categorySubCategory) {
          const [subCatID, subCatName, subCatLink, catID, catName, catLink] = this.buildDetails.categorySubCategory.split('::');
          this.buildDetails.catData = { subCatID, subCatName, subCatLink, catID, catName, catLink };
          if (this.userData.blnMaster) {
            if (this.buildDetails.blnProductNumbers) {
              this.buildDetails.storeProdURL = `${this.buildDetails.protocol}${this.buildDetails.storeURL}/${catLink}/${subCatLink}/${this.SEOFilter(this.buildDetails.permalink)}/${this.buildDetails.fk_storeProductID}`;
            } else {
              this.buildDetails.storeProdURL = `${this.buildDetails.protocol}${this.buildDetails.storeURL}/${catLink}/${subCatLink}/${this.SEOFilter(this.buildDetails.permalink)}`;
            }
          } else {
            this.buildDetails.storeProdURL = `${this.buildDetails.protocol}${this.buildDetails.storeURL}/${catLink}/${subCatLink}/${this.buildDetails.permalink}`;
          }
        }
      }
      this.buildDetails.virtualProofIDs = [];
      if (this.buildDetails.qryVirtualProof) {
        this.buildDetails.virtualProofIDs = this.buildDetails.qryVirtualProof.split(',');
      }
      this.ngStatus = this.buildDetails.pk_statusID;
      this.brandGuideExist = res["brandGuide"];
      this.buildDetails.blnAllHexColors = 1;
      if (this.buildDetails.allHexColors) {
        if (this.buildDetails.allHexColors.includes("N/A")) {
          this.buildDetails.blnAllHexColors = 0;
        }
      }
      this.checkColorQryImages();
      this.getImprintData(this.buildDetails.pk_productID);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  checkColorQryImages() {
    const path = `/globalAssets/Products/Colors/${this.buildDetails.pk_productID}/`;
    let payload = {
      files_fetch: true,
      path: path
    }
    this._commonService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.buildDetails.qryColorImages = true;
        this._changeDetectorRef.markForCheck();
      } else {
        this.buildDetails.qryColorImages = false;
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  SEOFilter(name: string): string {
    name = name.replace(/'/g, '');
    name = name.replace(/"/g, '');
    name = name.replace(/,/g, '');
    // ... continue with other replacements

    name = name.replace(/\//g, '-and-');
    name = name.replace(/\\/g, '-and-');
    name = name.replace(/ - /g, '-');
    name = name.replace(/ /g, '-');

    // Assuming you have a cleanHighASCII function
    name = this.cleanHighASCII(name);

    name = name.toLowerCase();

    return name;
  }

  private cleanHighASCII(name: string): string {
    // Implement your cleanHighASCII logic here
    // This function is assumed to be defined elsewhere in your code
    return name;
  }
  getImprintData(pid) {
    let params = {
      product_id: pid,
      rapidbuild_imprints: true,
      size: 50
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.imprintDetails = res["data"];
      this.artWorkDetails = res["artwork_templates"];
      this.getColorsData(this.buildDetails.fk_storeProductID);
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getColorsData(spid) {
    let params = {
      spid: spid,
      rapidbuild_colors: true,
      size: 50
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (this.userData.blnMaster) {
        res["data"].forEach(element => {
          this.checkIfImageExists(element);
        });
      }
      this.colorsData = res["data"];
      this.isLogoBankLoader = true;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
      this.getLogoBank()
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getLogoBank() {
    let params = {
      store_id: this.buildDetails.pk_storeID,
      rapidbuild_logobanks: true,
      size: 50
    }
    this._rapidService.getRapidBuildData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.logoData = res["data"];
      this.isLogoBankLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLogoBankLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigate(['/rapidbuild/image-management']);
  }
  removeBuild() {
    this.isRemoveLoader = true;
    let payload: removeRapidBuildEntry = {
      rbid: this.buildDetails.pk_rapidBuildID,
      spid: this.buildDetails.fk_storeProductID,
      remove_rapidbuild_entry: true
    };
    this._rapidService.UpdateAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._rapidService.snackBar(res["message"]);
      this.isRemoveLoader = false;
      this.backToList();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isRemoveLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateStatus() {
    let blnStatusUpdate = false;
    if (this.ngStatus != this.buildDetails.pk_statusID) {
      blnStatusUpdate = true;
    }
    let status = this.allStatus.filter(item => item.pk_statusID == this.buildDetails.pk_statusID);
    this.isUpdateLoader = true;
    let payload: updateStatus = {
      rbid: this.buildDetails.pk_rapidBuildID,
      imageStatusID: this.buildDetails.pk_statusID,
      blnLeaveComment: true,
      blnAdmin: this.userData.blnMaster,
      blnStatusUpdate: blnStatusUpdate,
      comments: this.buildDetails.proofComments,
      statusName: status[0].statusName,
      rapidbuild_userId: this.userData.pk_userID,
      rapidbuild_username: this.userData.userName,
      user_full_name: '',
      update_status: true
    };
    this._rapidService.UpdateAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStatus.forEach(element => {
        if (element.pk_statusID == this.buildDetails.pk_statusID) {
          this.buildDetails.statusName = element.statusName;
        }
      });
      this._rapidService.snackBar(res["message"]);
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateFlagStatus() {
    let blnStatusUpdate = false;
    if (this.buildDetails.pk_statusID != 1) {
      blnStatusUpdate = true;
    }
    let status = this.allStatus.filter(item => item.pk_statusID == this.buildDetails.pk_statusID);
    this.buildDetails.isUpdateLoader = true;
    let payload: updateStatus = {
      rbid: this.buildDetails.pk_rapidBuildID,
      imageStatusID: 1,
      blnLeaveComment: true,
      blnAdmin: this.userData.blnMaster,
      blnStatusUpdate: blnStatusUpdate,
      comments: this.buildDetails.proofComments,
      statusName: status[0].statusName,
      rapidbuild_userId: this.userData.pk_userID,
      rapidbuild_username: this.userData.userName,
      user_full_name: '',
      update_status: true
    };
    this._rapidService.UpdateAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.allStatus.forEach(element => {
        if (element.pk_statusID == 1) {
          this.buildDetails.statusName = element.statusName;
        }
      });
      this._rapidService.snackBar(res["message"]);
      this.buildDetails.pk_statusID = 1;
      this.buildDetails.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.buildDetails.isUpdateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  checkProof(ev) {
    this.ngProofCheck = false;
    this._changeDetectorRef.markForCheck();
  }
  checkStoreImages(ev) {
    this.storeProductImage = false;
    this._changeDetectorRef.markForCheck();
  }
  removeProof() {
    const paths: string[] = [`/globalAssets/rapidBuild/${this.buildDetails.pk_rapidBuildID}.jpg`];
    this.removeProofLoader = true;
    let payload = {
      files: paths,
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.removeProofLoader = false;
      this.ngProofCheck = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this._rapidService.snackBar('Current Removed Successfully!');
      this.ngProofCheck = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadFile(event) {
    this.imageValue = null;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageValue = {
        imageUpload: reader.result,
        type: file["type"]
      };
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 600 || image.height != 600) {
          this._rapidService.snackBar("Please provide a valid 600 x 600 JPG image to upload for the proof.");
          this.fileInput.nativeElement.value = '';
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };

        if (type != "image/jpeg") {
          this._rapidService.snackBar("Image extensions are allowed in JPG");
          this.fileInput.nativeElement.value = '';
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        }
        this._changeDetectorRef.markForCheck();
      };
    }
  };
  updateProof() {
    if (!this.imageValue) {
      this._rapidService.snackBar('Please provide a valid 600 x 600 JPG image to upload for the proof.');
      return;
    }
    if (this.imageValue) {
      this.uploadMedia();
    }
    let comment = '';
    if (this.ngProofComment) {
      comment = this.ngProofComment;
    }
    this.isUploadProofLoader = true;
    if (!this.ngProofCheck) {
      let payload: uploadProof = {
        rbid: this.buildDetails.pk_rapidBuildID,
        comments: comment,
        blnAdmin: this.userData.blnMaster,
        fk_imageStatusID: this.buildDetails.fk_imageStatusID,
        blnStatusUpdate: true,
        status_name: this.buildDetails.statusName,
        rapidbuild_userId: Number(this.userData.pk_userID),
        rapidbuild_username: this.userData.userName,
        upload_proof: true
      };
      this._rapidService.PostApiData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.isLoading = true;
        this.getRapidBuildDetails(this.params.id, this.params.store);
        this._rapidService.snackBar(res["message"]);
        this.ngProofComment = '';
        this.imageValue = null;
        this.ngProofCheck = true;
        this.isUploadProofLoader = false;
        this.fileInput.nativeElement.value = '';
        this.buildDetails.pk_statusID = 2;
        this.date = new Date().toLocaleString();
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isUploadProofLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    } else {
      let payload: updateProof = {
        rbid: this.buildDetails.pk_rapidBuildID,
        comments: this.ngProofComment || '',
        blnAdmin: this.userData.blnMaster,
        fk_imageStatusID: this.buildDetails.fk_imageStatusID,
        blnStatusUpdate: true,
        status_name: this.buildDetails.statusName,
        rapidbuild_userId: Number(this.userData.pk_userID),
        rapidbuild_username: this.userData.userName,
        update_proof: true
      };
      this._rapidService.UpdateAPIData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.isLoading = true;
        this.getRapidBuildDetails(this.params.id, this.params.store);
        this._rapidService.snackBar(res["message"]);
        this.ngProofComment = '';
        this.imageValue = null;
        this.isUploadProofLoader = false;
        this.fileInput.nativeElement.value = '';
        this.buildDetails.pk_statusID = 2;
        this.date = new Date().toLocaleString();
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.isUploadProofLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  uploadMedia() {
    const { pk_rapidBuildID } = this.buildDetails;
    const { imageUpload, name, type } = this.imageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/rapidBuild/${pk_rapidBuildID}.jpg`
    };
    this._rapidService.PostApiData(payload)
      .subscribe((response) => {
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  checkIfImageExists(item) {
    const img = new Image();
    img.src = `${this.assetsUrl}globalAssets/Products/Colors/${this.buildDetails.pk_productID}/${item.fk_colorID}.jpg`;
    if (img.complete) {

    } else {
      img.onload = () => {
        item.colorImage = true;
        this._changeDetectorRef.markForCheck();
        return true;
      };

      img.onerror = () => {
        item.colorImage = false;
        this._changeDetectorRef.markForCheck();
        return false;
      };
    }
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
