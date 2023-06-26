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
import { sendAutoRequest, UpdateArtworkTgas, UpdateQuoteOptions, updateQuotePurchaseOrderComment, updateReorderNumber } from '../../smartart.types';
@Component({
  selector: 'app-quote-details',
  templateUrl: './quote-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./quote-details.scss']
})
export class QuoteDashboardDetailsComponent implements OnInit, OnDestroy {
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
  imageValue: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = this._authService.parseJwt(this._authService.accessToken);
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res;
      this.getQuoteDetails();
    });
    this.isLoading = true;
    this.artWorkLoader = true;
  };
  getQuoteDetails() {
    let params = {
      quote_details: true,
      product_id: this.paramData.fk_productID,
      store_id: this.paramData.pk_storeID,
      cartLine_id: this.paramData.pk_cartLineID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quoteData = res["data"][0];
      this.approvalHistoryData = res["approvalHistory"];
      let tags = [];
      if (this.quoteData.artworkTags) {
        tags = this.quoteData.artworkTags.split(',');
        tags.forEach(element => {
          let tag = element.split(':');
          this.artworktags.push({ id: tag[0], name: tag[1] });
        });
      }
      this.selectedMultipleTags = [];
      let selectedTags = [];
      if (this.quoteData.cartlineArtworkTags) {
        selectedTags = this.quoteData.cartlineArtworkTags.split(',');
        selectedTags.forEach(element => {
          let tag = element.split(':');
          this.selectedMultipleTags.push(tag[0]);
        });
      }

      // this.isLoading = false;
      this.getQuoteImpritData();
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getQuoteImpritData() {
    let params = {
      quote_imprint_details: true,
      cartLine_id: this.paramData.pk_cartLineID,
      product_id: this.paramData.fk_productID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quoteImprintdata = res["data"];
      this.artworktemplatesData = res["artworkTemplates"];
      this.artWorkLoader = false;
      if (this.quoteImprintdata.length > 0) {
        this.selectedImprint = this.quoteImprintdata[0].imprintID;
        this.selectedProofImprint = this.quoteImprintdata[0].imprintID;
        this.selectedPurchaseImprint = this.quoteImprintdata[0];

        //   if (this.imprintdata[0].allColors) {
        //     let colors = this.imprintdata[0].allColors;
        //     let colorsArr = colors.split(',');
        //     let finalColor = [];
        //     colorsArr.forEach(element => {
        //       let color = element.split(':');
        //       finalColor.push({ id: color[0], name: color[1], hex: color[2] });
        //     });
        //     this.allColors = finalColor;
        //     this.selectedImprintColor = this.imprintdata[0].imprintColors;
        //   }
      }
      // this.getArtworkOther();
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToList() {
    this.router.navigate(['/smartart/quotes-dashboard']);
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
    let comment = `<b><span class="fa fa-circle disabled"></span> ${this.userData.name}</b> said on ${moment().format('MMM DD YYYY')} | ${moment().format('h:mm:ss')}<br>${this.ngComment}<br><br>`;
    // this.orderData.internalComments = this.orderData.internalComments + comment;
    setTimeout(() => {
      const element = document.getElementById('scrollBottomComment');
      element.scrollIntoView({ behavior: 'smooth' });
      this._changeDetectorRef.markForCheck();
    }, 100);
  }
  // Purchase Order COmment
  purchaseOrderComment(event) {

  }
  // Imprint Colors
  onChangeColor(event) {
    // let imprint = this.imprintdata.filter(item => item.pk_imprintID == event.value);
    // this.selectedImprint = imprint[0].pk_imprintID;
    // if (imprint[0].allColors) {
    //   let colors = imprint[0].allColors;
    //   let colorsArr = colors.split(',');
    //   let finalColor = [];
    //   colorsArr.forEach(element => {
    //     let color = element.split(':');
    //     finalColor.push({ id: color[0], name: color[1], hex: color[2] });
    //   });
    //   this.allColors = finalColor;
    //   this.selectedImprintColor = imprint[0].imprintColors;
    // }
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
  // Update Reorder
  updateReorder(imprint) {
    imprint.reorderLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateReorderNumber = {
      reorderNumber: imprint.reorderNumber,
      cartLineID: this.paramData.pk_cartLineID,
      imprintID: imprint.imprintID,
      update_reorder_number: true
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
  updateQuote() {
    this.updateQuoteInfoLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: UpdateQuoteOptions = {
      blnAdditionalProofContacts: this.quoteData.blnAdditionalApprovalOverride,
      blnIgnoreAdditionalArtEmails: this.quoteData.blnIgnoreAdditionalArtEmails,
      eventName: this.quoteData.event,
      bypassScheduler: this.quoteData.bypassScheduler,
      pk_cartLineID: Number(this.paramData.pk_cartLineID),
      pk_cartID: Number(this.paramData.fk_cartID),
      update_quote_options: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar('Quote information updated successfully');
      this.updateQuoteInfoLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateQuoteInfoLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updatePurchaseComment() {
    this.isPurchaseCommentLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateQuotePurchaseOrderComment = {
      purchaseOrderComment: this.selectedPurchaseImprint.originalArtworkComment,
      cartLineID: Number(this.paramData.pk_cartLineID),
      imprintID: Number(this.selectedPurchaseImprint.imprintID),
      update_quote_purchase_comment: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar('Quote information updated successfully');
      this.isPurchaseCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isPurchaseCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateArtworkTags() {
    if (this.selectedMultipleTags) {
      if (this.selectedMultipleTags.length > 0) {
        let tags = [];
        this.selectedMultipleTags.forEach(element => {
          tags.push(Number(element));
        });
        this.isArtworkTagsLoader = true;
        this._changeDetectorRef.markForCheck();
        let payload: UpdateArtworkTgas = {
          cartline_id: Number(this.paramData.pk_cartLineID),
          artwork_ids: tags,
          update_artwork_tags: true
        }
        this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          this._smartartService.snackBar(res["message"]);
          this.isArtworkTagsLoader = false;
          this._changeDetectorRef.markForCheck();
        }, err => {
          this.isArtworkTagsLoader = false;
          this._changeDetectorRef.markForCheck();
        });
      } else {
        this._smartartService.snackBar('Please select atleast 1 tag');
      }
    } else {
      this._smartartService.snackBar('Please select atleast 1 tag');
    }
  }
  // Auto Art Request
  senAutoArtRequest() {
    this.isAutoRequestLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: sendAutoRequest = {
      customer_email: '',
      customer_name: '',
      storeName: this.quoteData.storeName,
      store_id: this.quoteData.pk_storeID,
      storeURL: this.quoteData.storeURL,
      cartLineImprintID: this.paramData.fk_imprintID,
      userID: this.paramData.pfk_userID,
      cartLineID: this.paramData.pk_cartLineID,
      productName: this.quoteData.productName,
      cartID: this.paramData.fk_cartID,
      auto_art_request: true
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
  customerEmail() {
    const queryParams: NavigationExtras = {
      queryParams: { fk_imprintID: this.paramData.fk_imprintID, pfk_userID: this.paramData.pfk_userID, fk_cartID: this.paramData.fk_cartID, pk_cartLineID: this.paramData.pk_cartLineID, pk_storeID: this.paramData.pk_storeID, fk_productID: this.paramData.fk_productID, statusName: this.paramData.statusName }
    };
    this.router.navigate(['/smartart/email-customer'], queryParams);
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
    const img_path = `quoteProofDestination/${this.paramData.pfk_userID}/${this.paramData.fk_cartID}/${this.paramData.pk_cartLineID}/${this.selectedProofImprint}.jpg`;

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
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
