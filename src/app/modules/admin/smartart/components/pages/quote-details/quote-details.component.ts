import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../smartart.service';
import { AddSmartArtCartComment, sendAutoRequest, UpdateArtworkTgas, updateImprintColors, UpdateQuoteClaim, updateQuoteImprintTime, UpdateQuoteOptions, updateQuoteProofContact, updateQuotePurchaseOrderComment, updateReorderNumber } from '../../smartart.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
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
  isAddCommentLoader: boolean = false;
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
  selectedImprintPmsColor: any;
  selectedProofImprint: any;
  selectedImprintColor = '';
  selectedMultipleColors: any = [];
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

  // Updates
  updateQuoteInfoLoader: boolean = false;
  isPurchaseCommentLoader: boolean = false;
  isArtworkTagsLoader: boolean = false;
  isAutoRequestLoader: boolean = false;
  isManualProofLoader: boolean = false;
  imageValue: any;
  virtualProofData = [];
  artworkTags = [];
  selectedArtworkTags = [];
  contactProofs = [];
  smartArtUser: any;
  userDetails: any = JSON.parse(localStorage.getItem('userDetails'));
  brandGuideExist: boolean = false;
  // Timer
  selectedImprintForTimer: any;
  isTimerRunning: boolean = false;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;
  // Colors
  imprintColorsLoader: boolean = false;

  dataForNewComponent: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _activeRoute: ActivatedRoute,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.smartArtUser = JSON.parse(sessionStorage.getItem('smartArt'));
    this.userData = JSON.parse(localStorage.getItem('userDetails'));
    this._activeRoute.queryParams.subscribe(res => {
      this.paramData = res;
      this.getQuoteDetails();
    });
    this.isLoading = true;
    this.artWorkLoader = true;
  };
  formatDate(date): string {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());

    // Formatted date in 'yyyy-MM-dd' format
    return `${year}-${month}-${day}`;
  }
  private padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
  getQuoteDetails() {
    let params = {
      quote_details: true,
      product_id: this.paramData.fk_productID,
      store_id: this.paramData.pk_storeID,
      cartLine_id: this.paramData.pk_cartLineID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quoteData = res["data"][0];
      this.quoteData.inHandsDateValue = null;
      if (this.quoteData.formattedInHandsDate) {
        this.quoteData.inHandsDateValue = this.formatDate(new Date(this.quoteData.formattedInHandsDate));
      }
      this.quoteData.proof = 'N/A';
      if (this.quoteData.qryLatestProof) {
        const [name, date] = this.quoteData.qryLatestProof.split(',,')[0].split('::');
        this.quoteData.proof = `${name} @ ${date}`
      }

      this.approvalHistoryData = res["approvalHistory"];
      // let tags = [];
      // if (this.quoteData.artworkTags) {
      //   tags = this.quoteData.artworkTags.split(',');
      //   tags.forEach(element => {
      //     let tag = element.split(':');
      //     this.artworktags.push({ id: tag[0], name: tag[1] });
      //   });
      // }
      this.selectedMultipleTags = [];
      let selectedTags = [];
      if (this.quoteData.cartlineArtworkTags) {
        selectedTags = this.quoteData.cartlineArtworkTags.split(',');
        selectedTags.forEach(element => {
          let tag = element.split(':');
          this.selectedMultipleTags.push(tag[0]);
        });
      }
      // Quote Comments
      this.quoteData.quoteComments = [];
      if (this.quoteData.qryComments) {
        let comments = this.quoteData.qryComments.split(',,');
        comments.forEach(comment => {
          const [name, date, text] = comment.split('::');
          let htmlComment = `<b>${name}</b> said on ${date} <br /> ${text}`
          this.quoteData.quoteComments.push(htmlComment);
        });
      }

      // this.isLoading = false;
      // this.checkFileExist(`https://assets.consolidus.com/globalAssets/Stores/BrandGuide/${this.quoteData.pk_storeID}.pdf`, 'brand', 0);
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
      product_id: this.paramData.fk_productID,
      imprint_id: this.paramData.fk_imprintID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quoteImprintdata = res["data"];
      this.artworktemplatesData = res["artworkTemplates"];
      this.artWorkLoader = false;
      if (this.quoteImprintdata.length > 0) {
        this.selectedImprint = this.quoteImprintdata[0].imprintID;
        // this.selectedImprintPmsColor = this.quoteImprintdata[0].pmsColors;
        this.selectedProofImprint = this.quoteImprintdata[0].imprintID;
        this.selectedPurchaseImprint = this.quoteImprintdata[0];

        this.quoteImprintdata.forEach(imprint => {
          imprint.timerValues = '00:00:00';
          imprint.artworkFiles = [];
          imprint.packAccessories = [];
          this.setPackAndAccessories(imprint);
          this.setitemColorsWithIDs(imprint);

        });
        this.selectedImprintForTimer = this.quoteImprintdata[0];

        if (this.quoteImprintdata[0].allColors) {
          let colors = this.quoteImprintdata[0].allColors;
          let colorsArr = colors.split(',');
          let finalColor = [];
          colorsArr.forEach(element => {
            let color = element.split(':');
            finalColor.push({ id: color[0], name: color[1], hex: color[2] });
            if (this.quoteImprintdata[0].colorNameList) {
              if (this.quoteImprintdata[0].colorNameList.split(',').includes(color[1])) {
                this.selectedMultipleColors.push(color[1]);
              }
            }
          });
          this.allColors = finalColor;
        }
      }
      // this.getArtworkOther();
      const getArtworkOtherObservable = of(this.getArtworkOther());
      const getArtworkFiles = of(this.getArtworkFiles());

      forkJoin([
        // checkFileExistObservable,
        getArtworkOtherObservable,
        getArtworkFiles,
      ])

    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  setPackAndAccessories(imprint) {
    if (imprint.accessories_packaging) {
      const accessories = imprint.accessories_packaging.split(',,');
      accessories.forEach(packs => {
        const [quantity, packagingName] = packs.split('::');
        imprint.packAccessories.push({ quantity, packagingName });
      });
    }
  }

  getArtworkFiles() {
    let payload = {
      files_fetch: true,
      path: `/artwork/quotes/${this.quoteData.pk_storeID}/${this.paramData.pfk_userID}/${this.paramData.fk_cartID}/${this.paramData.pk_cartLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._smartartService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.quoteImprintdata.forEach(element => {
        files["data"].forEach(file => {
          if (file.ID.includes(element.imprintID)) {
            element.artworkFiles.push(file);
          }
        });
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  setitemColorsWithIDs(imprint) {
    imprint.itemColorsWithIDsData = [];
    if (imprint.Item_Colors) {
      let colors = imprint.Item_Colors.split(',,');
      colors.forEach(color => {
        const [quantity, sizeID, sizeName, id, name] = color.split('::');
        let image = false;
        this.checkImageExist(`https://assets.consolidus.com/globalAssets/Products/Colors/${this.quoteData.pk_productID}/${id}.jpg`).then(res => {
          if (res) {
            image = true;
          }
          imprint.itemColorsWithIDsData.push({ quantity, sizeID, sizeName, id, name, image });
        })
      });
    }
  }
  checkImageExist(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;

      if (img.complete) {
        resolve(true);
      } else {
        img.onload = () => {
          resolve(true);
        };

        img.onerror = () => {
          resolve(false);
        };
      }
    });
  }
  getArtworkOther() {
    this.artWorkLoader = true;
    let params = {
      quote_order_common_details: true,
      // cartLine_id: this.paramData.pk_cartLineID,
      // imprint_id: this.paramData.fk_imprintID,
      billingStudentOrgCode: this.quoteData.sessionArtworkBillingStudentOrgCode,
      rutgersStudentType: this.quoteData.sessionArtworkrutgersStudentType,
      storeUserID: this.quoteData.storeUserID,
      product_id: this.paramData.fk_productID,
      store_id: this.quoteData.pk_storeID,
      store_product_id: this.quoteData.productID
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
        if (res['storeArtworkTag'][0].storeArtworkTag) {
          let storeArtworkTag = res['storeArtworkTag'][0].storeArtworkTag.split(',,');
          storeArtworkTag.forEach(tag => {
            let tags = tag.split('::');
            this.artworkTags.push({ id: tags[0], name: tags[1] });
          });
          // this.artworkTags = res["storeArtworkTag"];
          this.selectedArtworkTags = [];
          if (this.quoteData['cartLineArtworkTags']) {
            let cartTags = this.quoteData['cartLineArtworkTags'].split(',');
            cartTags.forEach(tag => {
              let tags = tag.split(':');
              this.selectedArtworkTags.push(tags[0]);
            });
          }
          this._changeDetectorRef.markForCheck();
        }
        // this.quoteData["cartLineArtworkTags"].forEach(element => {
        //   this.selectedArtworkTags.push(element.fk_artworkTagID);
        // });
      }
      // Assign email recipients
      this.quoteImprintdata.forEach(imprint => {
        if ((imprint?.fk_artApprovalContactID || imprint?.fk_storeUserApprovalContactID) && !imprint?.blnStoreUserApprovalDone) {
          imprint.emailRecipients = this.quoteData.email;
        }
        if (!imprint.fk_artApprovalContactID && (!imprint.fk_storeUserApprovalContactID && !imprint.blnStoreUserApprovalDone)) {
          imprint.selectedContact = 0;
          if (imprint.methodName.toLowerCase().includes('screen')) {
            imprint.selectedContactEmail = this.quoteData.supplierInformationScreenprintEmail;
            this.quoteData.artworkEmail = imprint
          } else if (imprint.methodName.toLowerCase().includes('embroid')) {
            imprint.selectedContactEmail = this.quoteData.supplierInformationEmbroideryEmail;
          } else {
            imprint.selectedContactEmail = this.quoteData.supplierInformationArtworkEmail;
          }
          this.quoteData.artworkEmail = imprint.selectedContactEmail;
        } else {
          imprint.selectedContact = null;
          if (imprint.methodName.toLowerCase().includes('screen')) {
            imprint.selectedContactEmail = this.quoteData.supplierInformationScreenprintEmail;
          } else if (imprint.methodName.toLowerCase().includes('embroid')) {
            imprint.selectedContactEmail = this.quoteData.supplierInformationEmbroideryEmail;
          } else {
            imprint.selectedContactEmail = this.quoteData.supplierInformationArtworkEmail;
          }
          this.quoteData.artworkEmail = imprint.selectedContactEmail;
        }
      });
      // Contact Proof
      if (res["contactProofs"]) {
        res["contactProofs"].forEach(element => {
          if (element.blnStoreUserApprovalContact) {
            element.value = element.storeUserApprovalID;
          } else {
            element.value = element.artApprovalContactID;
          }
          this.quoteImprintdata.forEach(imprint => {
            if (imprint?.fk_storeUserApprovalContactID && !imprint?.blnStoreUserApprovalDone) {
              if (imprint?.fk_storeUserApprovalContactID == element.storeUserApprovalID) {
                imprint.selectedContact = element;
                imprint.selectedContactEmail = element.email;
              }
            } else if (imprint?.fk_artApprovalContactID && (imprint?.fk_artApprovalContactID == element.artApprovalContactID)) {
              imprint.selectedContact = element;
              imprint.selectedContactEmail = element.email;
            }
          });
          element.blnStoreUserApproval = element.blnStoreUserApprovalContacts ? 1 : 0;
        });
        this.contactProofs = res["contactProofs"];
      }

      this.dataForNewComponent = {
        quoteData: this.quoteData,
        quoteImprintdata: this.quoteImprintdata,
        paramData: this.paramData,
        smartArtUser: this.smartArtUser,
        artworktemplatesData: this.artworktemplatesData,
        contactProofs: this.contactProofs
      }

      this.artWorkLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      console.error('Error fetching SmartArt data', err);
      this.isLoading = false;
      this.artWorkLoader = false;
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
      cartLine_id: this.paramData.pk_cartLineID,
      imprint_id: this.paramData.fk_imprintID
    }
    this.lastProofLoader = true;
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length > 0) {
        this.lastProofData = res["data"][0];
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
    if (this.ngComment.trim() == '') {
      this._smartartService.snackBar('Comment is required');
      return;
    }
    this.isAddCommentLoader = true;
    let payload: AddSmartArtCartComment = {
      cartID: Number(this.paramData.fk_cartID),
      comment: this.ngComment.replace(/'/g, "''"),
      fk_adminUserID: Number(this.userData.pk_userID),
      add_smartart_cart_comment: true
    }
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let htmlComment = [`<b>${this.userData.firstName + ' ' + this.userData.lastName}</b> said on ${moment().format('MM/DD/YYYY')} @  ${moment().format('h:mm:ss')} <br /> ${this.ngComment}`];
      this.quoteData.quoteComments = htmlComment.concat(this.quoteData.quoteComments);
      this.ngComment = ''
      this._smartartService.snackBar(res["message"]);
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isAddCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Purchase Order COmment
  purchaseOrderComment(event) {

  }
  // Imprint Colors
  onChangeColor(event) {
    let imprint = this.quoteImprintdata.filter(item => item.imprintID == event.value);
    this.selectedImprint = imprint[0].imprintID;
    // this.selectedImprintPmsColor = imprint[0].pmsColors;
    if (imprint[0].allColors) {
      let colors = this.quoteImprintdata[0].allColors;
      let colorsArr = colors.split(',');
      let finalColor = [];
      colorsArr.forEach(element => {
        let color = element.split(':');
        finalColor.push({ id: color[0], name: color[1], hex: color[2] });
        if (this.quoteImprintdata[0].colorNameList) {
          if (this.quoteImprintdata[0].colorNameList.split(',').includes(color[1])) {
            this.selectedMultipleColors.push(color[1]);
          }
        }
      });
      this.allColors = finalColor;
    }
    this._changeDetectorRef.markForCheck();
  }
  // Imprint Colors
  updateOrderLineImprintColors() {
    let updatedColors = [...this.selectedMultipleColors];

    let colors = [...this.selectedMultipleColors];
    if (this.selectedImprintPmsColor) {
      colors.push(this.selectedImprintPmsColor);
    }
    this.imprintColorsLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateImprintColors = {
      colorNameList: colors.toString(),
      pmsColors: this.selectedImprintPmsColor,
      fk_cartLineID: Number(this.paramData.pk_cartLineID),
      imprint_id: Number(this.selectedImprint),
      update_quote_imprint_colors: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        const index = this.quoteImprintdata.findIndex(item => item.imprintID == this.selectedImprint);
        this.quoteImprintdata[index].colorNameList = colors.toString();
        this.quoteImprintdata[index].pmsColors = this.selectedImprintPmsColor;
        if (this.selectedImprintPmsColor && this.allColors) {
          const colorExists = this.allColors.find(element => element.name === this.selectedImprintPmsColor);
          if (colorExists && !this.selectedMultipleColors.includes(this.selectedImprintPmsColor)) {
            updatedColors.push(this.selectedImprintPmsColor);
          }
        }
        this.selectedMultipleColors = updatedColors;
        this.selectedImprintPmsColor = '';
        // this.orderData.internalComments = this.orderData.internalComments + res["comment"];
        // this.ngComment = '';
        this._smartartService.snackBar(res["message"]);
        this._changeDetectorRef.markForCheck();
      }
      this.imprintColorsLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.imprintColorsLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Timer
  startTimer() {
    this.isTimerRunning = true;
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
      this.selectedImprintForTimer.timerValues = `${this.formattedHours}:${this.formattedMinutes}:${this.formattedSeconds}`;
      this._changeDetectorRef.markForCheck();
    }, 1000);
  }
  formatNumber(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  // Getter methods to get formatted minutes and seconds
  get formattedHours(): string {
    return this.formatNumber(this.hours);
  }

  get formattedMinutes(): string {
    return this.formatNumber(this.minutes);
  }

  get formattedSeconds(): string {
    return this.formatNumber(this.seconds);
  }
  stopTimer() {
    clearInterval(this.intervalId);
    this.isTimerRunning = false;
    this._changeDetectorRef.markForCheck();
  }
  resetTimer() {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.selectedImprintForTimer.timerValues = `${this.formattedHours}:${this.formattedMinutes}:${this.formattedSeconds}`;
    this._changeDetectorRef.markForCheck();
  }
  changeTimerImprints() {
    this.resetTimer();
  }
  saveImprintTimerValue() {
    this.selectedImprintForTimer.timerLoader = true;
    this._changeDetectorRef.markForCheck();
    let totalSeconds =
      parseInt(this.selectedImprintForTimer.time.slice(0, 2), 10) * 3600 +
      parseInt(this.selectedImprintForTimer.time.slice(3, 5), 10) * 60 +
      parseInt(this.selectedImprintForTimer.time.slice(6), 10);

    totalSeconds += this.hours * 3600 + this.minutes * 60 + this.seconds;

    // Ensure that values do not exceed 60 for minutes and seconds
    const newHours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const newMinutes = Math.floor(remainingSeconds / 60);
    const newSeconds = remainingSeconds % 60;

    const timerValue =
      this.formatNumber(newHours) + ':' +
      this.formatNumber(newMinutes) + ':' +
      this.formatNumber(newSeconds);

    // Reset the timer values
    this.stopTimer();
    let payload: updateQuoteImprintTime = {
      newTime: timerValue,
      imprintID: this.selectedImprintForTimer.imprintID,
      cartLineID: Number(this.paramData.pk_cartLineID),
      update_quote_imprint_time: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.selectedImprintForTimer.timerLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
        this.selectedImprintForTimer.time = timerValue;
      }
      this._changeDetectorRef.markForCheck();
    });
  }
  // End Timer
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
    let date = this.quoteData.inHandsDateValue;
    let converDate;
    if (date) {
      converDate = moment(date).format('MM/DD/yyyy')
    }

    if (date && !moment(date).isAfter(moment())) {
      this._smartartService.snackBar('Please enter an in-hands date in the future.');
      return;
    }


    this.updateQuoteInfoLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: UpdateQuoteOptions = {
      inHandsDate: converDate,
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
  // Update Proof Contact
  updateProofContact(imprint) {
    let artAprrovalID;
    if (imprint.selectedContact == 0) {
      artAprrovalID = 0;
    } else {
      artAprrovalID = imprint.selectedContact.pk_approvalContactID;
    }
    imprint.isProofLoader = true;
    let payload: updateQuoteProofContact = {
      artApproval_contact_id: artAprrovalID,
      cartline_id: Number(this.paramData.pk_cartLineID),
      imprint_id: Number(imprint.imprintID),
      update_quote_proof_contact: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
        if (imprint.selectedContact == 0) {
          imprint.selectedContactEmail = this.quoteData.email;
        } else {
          imprint.selectedContactEmail = imprint.selectedContact.email;
        }
      }
      imprint.isProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.isProofLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // // Update Claim
  updateClaim(item, check) {
    item.isClaimLoader = true;
    let claimID = null;
    if (check) {
      claimID = this.userData.pk_userID;
    } else {
      claimID = null;
    }
    this._changeDetectorRef.markForCheck();
    let payload: UpdateQuoteClaim = {
      cartLineID: Number(item.pk_cartLineID),
      blnClaim: check,
      fk_smartArtDesignerClaimID: claimID,
      update_quote_claim: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
      }
      item.isClaimLoader = false;
      item.fk_smartArtDesignerClaimID = claimID;
      // item.blnAttention = check;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.isClaimLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  backToListBySearch() {
    this.router.navigateByUrl(`/smartart/quotes-dashboard?search=${this.paramData.fk_cartID}&customer=`);
  }
  checkFileExist(url, type, index) {
    let params = {
      file_check: true,
      url: url
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (type == 'brand') {
        this.brandGuideExist = res["isFileExist"];
      }
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
