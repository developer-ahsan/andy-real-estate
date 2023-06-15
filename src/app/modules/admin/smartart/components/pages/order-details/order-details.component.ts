import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { interval } from 'rxjs';
import { AddOrderComment, UpdateArtworkTags, UpdateArtworkTgas, UpdateOrderInformation, sendAutoRequest, sendAutoRequestOrder, updateOrderLineImprintColors, updateReorderNumberOrder } from '../../smartart.types';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./order-detail.scss']
})
export class OrderDashboardDetailsComponent implements OnInit, OnDestroy {
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
  orderData: any;
  imprintdata: any;
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
  selectedImprintColor = '';
  selectedMultipleColors: any;
  // Artwork templates
  artWorkLoader: boolean = false;
  artworktemplatesData: any;
  // Virtual Proof Images
  virtualProofData: any;
  // Approval History
  approvalHistoryData: any;
  // artwork tags
  artworkTags: any;

  // Timer
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;
  isAutoRequestLoader: boolean;
  imageValue: any;
  isManualProofLoader: boolean;
  selectedProofImprint: any;

  imprintColorsLoader: boolean = false;
  isAddCommentLoader: boolean;

  smartArtUser: any;
  viewProofCheck: boolean = false;
  brandGuideExist: boolean = false;
  selectedArtworkTags: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.smartArtUser = JSON.parse(sessionStorage.getItem('smartArt'));
    this.userData = this._authService.parseJwt(this._authService.accessToken);
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res
    });
    this.isLoading = true;
    this.getOrderDetails();
  };
  getOrderDetails() {
    let params = {
      order_online_details_v2: true,
      orderLine_id: this.paramData.pk_orderLineID,
      order_id: this.paramData.fk_orderID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderData = res["data"][0];
      this.getImpritData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getImpritData() {
    let params = {
      order_online_details_imprints_colors: true,
      orderLine_id: this.paramData.pk_orderLineID,
      orderLineImprint_id: this.paramData.fk_imprintID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.approvalHistoryData = res["approvalHistory"];
      this.imprintdata = res["data"];
      if (this.imprintdata.length > 0) {
        this.selectedImprint = this.imprintdata[0].pk_imprintID;
        this.selectedProofImprint = this.imprintdata[0].imprintID;
        if (this.imprintdata[0].allColors) {
          let colors = this.imprintdata[0].allColors;
          let colorsArr = colors.split(',');
          let finalColor = [];
          colorsArr.forEach(element => {
            let color = element.split(':');
            finalColor.push({ id: color[0], name: color[1], hex: color[2] });
          });
          this.allColors = finalColor;
          this.selectedImprintColor = this.imprintdata[0].imprintColors;
        }
      }
      this.checkFileExist(`https://assets.consolidus.com/globalAssets/Stores/BrandGuide/${this.orderData.pk_storeID}.pdf`, 'brand');
      this.getArtworkOther();
      this.checkIfImageExists(`https://assets.consolidus.com/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.jpg`);
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getArtworkOther() {
    this.artWorkLoader = true;
    let params = {
      order_online_details_artApproval: true,
      orderLine_id: this.paramData.pk_orderLineID,
      imprint_id: this.paramData.fk_imprintID,
      product_id: this.orderData.fk_productID,
      store_id: this.orderData.pk_storeID,
      store_product_id: this.orderData.pk_storeProductID
    }
    this.artworktemplatesData = [];
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["artworkTemplate"]) {
        this.artworktemplatesData = res["artworkTemplate"];
      }
      if (res["virtualProof"]) {
        this.virtualProofData = res["virtualProof"];
      }
      if (res["storeArtworkTag"]) {
        this.artworkTags = res["storeArtworkTag"];
        this.selectedArtworkTags = [];
        res["orderLineArtworkTag"].forEach(element => {
          this.selectedArtworkTags.push(element);
        });
      }
      this.artWorkLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.artWorkLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigate(['/smartart/orders-dashboard']);
  }
  // Last Proof
  lastProof() {
    let params = {
      art_proof: true,
      orderLine_id: this.paramData.pk_orderLineID,
      imprint_id: this.paramData.fk_imprintID
    }
    this.lastProofLoader = true;
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.lastProofData = res["data"][0].proofSentDate;
      } else {
        this.lastProofData = 'N/A';
      }
      this.lastProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.lastProofLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Add Comment
  addComment() {
    this.isAddCommentLoader = true;
    let payload: AddOrderComment = {
      internalComments: this.ngComment,
      order_id: this.paramData.fk_orderID,
      add_order_comment: true
    }
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let comment = `<b><span class="fa fa-circle disabled"></span> ${this.userData.name}</b> said on ${moment().format('MMM DD YYYY')} | ${moment().format('h:mm:ss')}<br>${this.ngComment}<br><br>`;
      this.orderData.internalComments = this.orderData.internalComments + comment;
      setTimeout(() => {
        const element = document.getElementById('scrollBottomComment');
        element.scrollIntoView({ behavior: 'smooth' });
        this._changeDetectorRef.markForCheck();
        this.ngComment = '';
      }, 100);
      this._smartartService.snackBar(res["message"]);
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    });

  }
  // Imprint Colors
  onChangeColor(event) {
    let imprint = this.imprintdata.filter(item => item.pk_imprintID == event.value);
    this.selectedImprint = imprint[0].pk_imprintID;
    if (imprint[0].allColors) {
      let colors = imprint[0].allColors;
      let colorsArr = colors.split(',');
      let finalColor = [];
      colorsArr.forEach(element => {
        let color = element.split(':');
        finalColor.push({ id: color[0], name: color[1], hex: color[2] });
      });
      this.allColors = finalColor;
      this.selectedImprintColor = imprint[0].imprintColors;
    }
  }
  // Timer
  startTimer() {
    this.resetTimer();
    this.intervalId = setInterval(() => {
      this.seconds++;
      if (this.seconds === 60) {
        this.seconds = 0;
        this.minutes++;
      }
      if (this.minutes === 60) {
        this.minutes = 0;
        this.hours++;
      }
      this._changeDetectorRef.markForCheck();
    }, 1000);
  }
  resetTimer() {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    clearInterval(this.intervalId);
    this._changeDetectorRef.markForCheck();
  }

  // Put Calls
  // Auto Art Request
  senAutoArtRequest() {
    this.isAutoRequestLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: sendAutoRequestOrder = {
      customer_email: '',
      customer_name: '',
      storeName: this.orderData.storeName,
      store_id: this.orderData.pk_storeID,
      storeURL: this.orderData?.storeURL,
      orderLineImprintID: Number(this.paramData.fk_imprintID),
      userID: this.paramData.pfk_userID,
      orderLineID: Number(this.paramData.pk_orderLineID),
      productName: this.orderData.productName,
      orderID: Number(this.paramData.fk_orderID),
      auto_order_art_request: true
    }
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      this.isAutoRequestLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAutoRequestLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Reorder
  updateReorder(imprint) {
    imprint.reorderLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateReorderNumberOrder = {
      reorderNumber: imprint.reorderNumber,
      orderline_id: this.paramData.pk_orderLineID,
      imprint_id: imprint.pk_imprintID,
      update_order_reorder_number: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar('Reorder updated successfully');
      imprint.reorderLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.reorderLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Manually Upload Proof
  uploadFile(event): void {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      if (file)
        reader.readAsDataURL(file);
      reader.onload = () => {
        let image: any = new Image;
        image.src = reader.result;
        image.onload = () => {
          this.imageValue = {
            imageUpload: reader.result,
            type: file["type"]
          };
        }
      }
    }
  };
  uploadProofMedia() {
    if (!this.imageValue) {
      this._smartartService.snackBar('Please choose any image');
      return;
    }
    this.isManualProofLoader = true;
    this._changeDetectorRef.markForCheck();
    let base64;
    const { imageUpload } = this.imageValue;
    base64 = imageUpload.split(",")[1];
    const img_path = `proofDestination/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.selectedProofImprint}.jpg`;

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };
    this._smartartService.AddSmartArtData(payload).subscribe(res => {
      this.imageValue = null;
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
      }
      this.isManualProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isManualProofLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Imprint Colors
  updateOrderLineImprintColors() {
    this.imprintColorsLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateOrderLineImprintColors = {
      imprintColors: this.selectedMultipleColors.toString(),
      orderline_id: this.paramData.pk_orderLineID,
      imprint_id: this.selectedImprint,
      update_order_imprint_colors: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      this.imprintColorsLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.imprintColorsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Order Information
  updateOrderInformation() {
    let date = this.orderData.inHandsDate;
    let converDate;
    if (date) {
      converDate = moment(date).format('MM/DD/yyyy')
    }
    this.orderData.isOrderInfoLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: UpdateOrderInformation = {
      inHandsDate: converDate,
      blnIgnoreAdditionalProofEmails: this.orderData.blnIgnoreAdditionalArtEmails,
      blnAdditionalApprovalOverride: this.orderData.blnAdditionalApprovalOverride,
      event: this.orderData.event,
      blnBypassScheduler: this.orderData.bypassScheduler,
      orderId: this.orderData.fk_orderID,
      orderLineID: Number(this.paramData.pk_orderLineID),
      update_order_info: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      this.orderData.isOrderInfoLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.orderData.isOrderInfoLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Artwork tags
  updateArtWorkTags() {
    this.artworkTags.updateLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: UpdateArtworkTags = {
      cartline_id: Number(),
      artwork_ids: this.selectedArtworkTags,
      update_artwork_tags: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      this.artworkTags.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.artworkTags.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Customer Eamils
  customerEmail(item) {
    const queryParams: NavigationExtras = {
      queryParams: { pfk_userID: this.paramData.pfk_userID, fk_orderID: this.paramData.fk_orderID, fk_imprintID: this.paramData.fk_imprintID, pk_orderLineID: this.paramData.pk_orderLineID, statusName: this.paramData.statusName }
    };
    this.router.navigate(['/smartart/email-customer'], queryParams);
  }
  checkIfImageExists(url) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        this.viewProofCheck = true;
      };

      img.onerror = () => {
        this.viewProofCheck = false;
        return;
      };
    }
  };
  checkFileExist(url, type) {
    let params = {
      file_check: true,
      url: url
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (type == 'brand') {
        this.brandGuideExist = res["isFileExist"];
      }
    })
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    clearInterval(this.intervalId);
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
