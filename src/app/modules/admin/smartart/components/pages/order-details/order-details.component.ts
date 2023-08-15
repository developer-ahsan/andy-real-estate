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
import { interval } from 'rxjs';
import { AddOrderComment, UpdateOrderLineArtworkTags, UpdateArtworkTgas, UpdateOrderInformation, sendAutoRequest, updateOrderLineImprintColors, updateReorderNumberOrder, UpdateOrderLineClaim, updateOrderProofContact, SmartartImprintStatusUpdate, sendAutoRequestOrder, updateAttentionFlagOrder, sendOrderProofUpdate, UploadOrderArtProof, UploadOrderFinalArt } from '../../smartart.types';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./order-detail.scss']
})
export class OrderDashboardDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @ViewChild('artworkFileInput') artworkFileInput: ElementRef;
  @ViewChild('finalArtworkFileInput') finalArtworkFileInput: ElementRef;
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
  artworkTags: any = [];

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
  viewFinalArtworkCheck: boolean = false;
  brandGuideExist: boolean = false;
  selectedArtworkTags: any;
  // contactProofs
  contactProofs = [];
  selectedContact: any;
  selectedContactEmail = '';

  imageArtworkValue: any;
  imageFinalArtworkValue: any;
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
      this.orderData.sessionProofEmails = [];
      if (this.orderData.proofEmail) {
        let proofEmails = this.orderData.proofEmail.split(',');
        this.orderData.sessionProofEmails = proofEmails;
      }
      this.orderData.sessionDecoratorEmails = [];
      if (this.orderData.sessionArtwork_artworkEmail) {
        let decoratorEmails = this.orderData.sessionArtwork_artworkEmail.split(',')
        this.orderData.sessionDecoratorEmails = decoratorEmails;
      }
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
        this.orderData.artworkEmail = this.imprintdata[0].artworkEmail;
        this.selectedImprint = this.imprintdata[0].pk_imprintID;
        this.selectedProofImprint = this.imprintdata[0].imprintID;
        this.imprintdata.forEach(imprint => {
          imprint.artworkFiles = [];
          imprint.viewFinalArtworkCheck = null;
          if (imprint.allColors) {
            let colors = imprint.allColors;
            let colorsArr = colors.split(',');
            let finalColor = [];
            colorsArr.forEach(element => {
              let color = element.split(':');
              finalColor.push({ id: color[0], name: color[1], hex: color[2] });
            });
            this.allColors = finalColor;
            this.selectedImprintColor = imprint.imprintColors;
          }
          imprint.poSent = null;
          if (res["poSent"].length) {
            if (imprint.pk_statusID >= 5) {
              imprint.poSent = res["poSent"][0];
            } else {
              imprint.poSent = null;
            }
          }
        });
      }
      const checkFileExistObservable = of(this.checkFileExist(`https://assets.consolidus.com/globalAssets/Stores/BrandGuide/${this.orderData.pk_storeID}.pdf`, 'brand', 0));
      const checkFinalArtworkObservable = of(this.checkFileExist(`https://assets.consolidus.com/artwork/finalArt/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.eps`, 'finalArtwork', 0));
      const getArtworkOtherObservable = of(this.getArtworkOther());
      const checkIfImageExistsObservable = of(this.checkIfImageExists(`https://assets.consolidus.com/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.jpg`));
      const getArtworkFiles = of(this.getArtworkFiles());
      forkJoin([
        checkFileExistObservable,
        checkFinalArtworkObservable,
        getArtworkOtherObservable,
        checkIfImageExistsObservable,
        getArtworkFiles
      ])
      // this.checkFileExist(`https://assets.consolidus.com/globalAssets/Stores/BrandGuide/${this.orderData.pk_storeID}.pdf`, 'brand');
      // this.checkFileExist(`https://assets.consolidus.com/artwork/finalArt/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.eps`, 'finalArtwork');
      // this.getArtworkOther();
      // this.checkIfImageExists(`https://assets.consolidus.com/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.jpg`);
      // this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getArtworkOther() {
    // this.selectedContactEmail = this.orderData?.shippingEmail;
    this.artWorkLoader = true;
    let params = {
      quote_order_common_details: true,
      // orderLine_id: this.paramData.pk_orderLineID,
      // imprint_id: this.paramData.fk_imprintID,
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
        if (res['storeArtworkTag'][0].storeArtworkTag) {
          let storeArtworkTag = res['storeArtworkTag'][0].storeArtworkTag.split(',,');
          storeArtworkTag.forEach(tag => {
            let tags = tag.split('::');
            this.artworkTags.push({ pk_artworkTagID: tags[0], name: tags[1] });
          });
          // this.artworkTags = res["storeArtworkTag"];
          this.selectedArtworkTags = [];
          if (this.orderData['orderLineArtworkTag']) {
            let cartTags = this.orderData['orderLineArtworkTag'].split(',');
            cartTags.forEach(tag => {
              let tags = tag.split(':');
              this.selectedArtworkTags.push(tags[0]);
            });
          }
        }

        // res["orderLineArtworkTag"].forEach(element => {
        //   this.selectedArtworkTags.push(element.fk_artworkTagID);
        // });
      }
      // Assign email recipients
      this.imprintdata.forEach(imprint => {
        // let status = imprint.pk_statusID;
        imprint.blnIncludeApproveByDate = false;
        imprint.proofComments = '';
        imprint.statusID = 9;
        imprint.emailRecipients = '';
        // NEW PENDING
        if (imprint.pk_statusID == 2) {
          if (imprint.fk_artApprovalContactID && !imprint.blnStoreUserApprovalDone) {
            imprint.emailRecipients = imprint.proofContactEmail;
          } else {
            // session.artwork.email
            imprint.emailRecipients = this.orderData.sessionArtworkEmail;
          }
        }
        // AWAITING ARTWORK APPROVAL || ON-HOLD || FOLLOW UP FOR APPROVAL
        else if (imprint.pk_statusID == 3 || imprint.pk_statusID == 12 || imprint.pk_statusID == 13) {
          if ((imprint?.fk_artApprovalContactID || imprint?.fk_storeUserApprovalContactID) && !imprint?.blnStoreUserApprovalDone) {
            imprint.emailRecipients = imprint.proofContactEmail;
          } else {
            // session.artwork.email
            imprint.emailRecipients = this.orderData.sessionArtworkEmail;
          }
        }
        // ARTWORK REVISION 
        else if (imprint.pk_statusID == 4) {
        }
        // DECORATOR NOTIFIED || IN PRODUCTION || PO Sent
        else if (imprint.pk_statusID == 5 || imprint.pk_statusID == 11 || imprint.pk_statusID == 16) {
          // session.artwork.decoratorEmail#
          imprint.emailRecipients = this.orderData.sessionArtwork_artworkEmail;
        }
        // NO PROOF NEEDED
        else if (imprint.pk_statusID == 7) {
        }
        // ARTWORK APPROVED
        else if (imprint.pk_statusID == 9) {

        }
        // IN PRODUCTION
        else if (imprint.pk_statusID == 11) {
        }
        // WAITING FOR GROUP ORDER
        else if (imprint.pk_statusID == 17) {
        }

        if (!imprint?.fk_artApprovalContactID && !imprint?.fk_storeUserApprovalContactID && !imprint?.blnStoreUserApprovalDone) {
          imprint.selectedContact = this.orderData.sessionArtwork_artApprovalContactID;
          if (imprint.decorationName.toLowerCase().includes('screen')) {
            imprint.selectedContactEmail = imprint.screenprintEmail;
            this.orderData.artworkEmail = imprint
          } else if (imprint.decorationName.toLowerCase().includes('embroid')) {
            imprint.selectedContactEmail = imprint.embroideryEmail;
          } else {
            imprint.selectedContactEmail = imprint.artworkEmail;
          }
          this.orderData.artworkEmail = imprint.selectedContactEmail;
        } else {
          imprint.selectedContact = null;
          if (imprint.decorationName.toLowerCase().includes('screen')) {
            imprint.selectedContactEmail = imprint.screenprintEmail;
            this.orderData.artworkEmail = imprint
          } else if (imprint.decorationName.toLowerCase().includes('embroid')) {
            imprint.selectedContactEmail = imprint.embroideryEmail;
          } else {
            imprint.selectedContactEmail = imprint.artworkEmail;
          }
          this.orderData.artworkEmail = imprint.selectedContactEmail;
        }
      });
      // Contact Proof
      if (res["contactProofs"]) {
        res["contactProofs"].forEach(element => {
          if (element.blnStoreUserApprovalContact) {
            element.value = element.pk_approvalContactID;
          } else {
            element.value = element.pk_artApprovalContactID;
          }
          this.imprintdata.forEach(imprint => {
            if (imprint?.fk_storeUserApprovalContactID && !imprint?.blnStoreUserApprovalDone) {
              if (imprint?.fk_storeUserApprovalContactID == element.pk_approvalContactID) {
                imprint.selectedContact = element;
                imprint.selectedContactEmail = element.email;
              }
            } else if (imprint?.fk_artApprovalContactID && imprint?.fk_artApprovalContactID == element.pk_artApprovalContactID) {
              imprint.selectedContact = element;
              imprint.selectedContactEmail = element.email;
            }
          });
          element.blnStoreUserApproval = element.blnStoreUserApprovalContacts ? 1 : 0;
        });
        this.contactProofs = res["contactProofs"];
      }
      this.artWorkLoader = false;
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.artWorkLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getArtworkFiles() {
    let payload = {
      files_fetch: true,
      path: `/artwork/${this.orderData.pk_storeID}/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._smartartService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.imprintdata.forEach(element => {
        files["data"].forEach(file => {
          if (file.ID.includes(element.pk_imprintID)) {
            element.artworkFiles.push(file);
          }
        });
      });
      // this.imprintdata[index].artworkFiles = files["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  openExpansion(imprint, index) {
    // if (imprint.artworkFiles.length == 0) {
    //   this.getArtworkFiles(index);
    // }
    if (!imprint.viewFinalArtworkCheck) {
      this.checkFileExist(`https://assets.consolidus.com/artwork/finalArt/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.eps`, 'finalArtwork', index)
    }
  }
  backToList() {
    this.router.navigate(['/smartart/orders-dashboard']);
  }
  backToListBySearch() {
    this.router.navigateByUrl(`/smartart/orders-dashboard?search=${this.paramData.fk_orderID}&customer=&product=`);
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
    let index = this.imprintdata.findIndex(imp => imp.pk_imprintID == this.paramData.fk_imprintID)
    this.isAutoRequestLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: sendAutoRequestOrder = {
      firstName: this.orderData?.firstName,
      lastName: this.orderData?.lastName,
      email: this.orderData.email,
      proofEmail: this.orderData.proofEmail,
      fk_artApprovalContactID: this.imprintdata[index].fk_artApprovalContactID,
      blnAdditionalArtApproval: this.orderData.blnAdditionalArtApproval,
      blnEProcurement: this.orderData.blnEProcurement,
      storeName: this.orderData.storeName,
      store_id: this.orderData.pk_storeID,
      storeURL: this.orderData.storeURL,
      orderLineImprintID: Number(this.paramData.fk_imprintID),
      userID: Number(this.orderData.pfk_userID),
      orderLineID: Number(this.paramData.pk_orderLineID),
      productNumber: this.orderData.sessionArtwork_productNumber,
      productName: this.orderData.sessionArtwork_productName,
      smartArtLoggedInUserName: this.smartArtUser.firstName + ' ' + this.smartArtUser.lastName,
      orderID: this.orderData.pk_orderID,
      auto_order_art_request: true
    }
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      this.imprintdata[index].imprintComments = this.imprintdata[index].imprintComments + ' <br>' + res["comment"];
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
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
      }
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
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
      }
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
    let payload: UpdateOrderLineArtworkTags = {
      orderLineID: Number(this.paramData.pk_orderLineID),
      artwork_ids: this.selectedArtworkTags,
      update_orderline_artwork_tags: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
      }
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
      queryParams: { pk_orderLineID: this.paramData.pk_orderLineID, store_id: this.orderData.pk_storeID }
    };
    this.router.navigate(['/smartart/order-emails'], queryParams);
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
  checkFileExist(url, type, index) {
    let params = {
      file_check: true,
      url: url
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (type == 'brand') {
        this.brandGuideExist = res["isFileExist"];
      } else if (type == 'finalArtwork') {
        this.imprintdata[index].viewFinalArtworkCheck = res["isFileExist"];
      }
    })
  }
  // // Update Claim
  updateClaim(item, check) {
    item.isClaimLoader = true;
    let claimID = null;
    if (check) {
      claimID = Number(this.smartArtUser.adminUserID)
    } else {
      claimID = null;
    }
    this._changeDetectorRef.markForCheck();
    let payload: UpdateOrderLineClaim = {
      orderLineID: Number(this.paramData.pk_orderLineID),
      blnClaim: check,
      fk_smartArtDesignerClaimID: claimID,
      update_orderline_claim: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
        item.fk_smartArtDesignerClaimID = claimID;
      }
      item.isClaimLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.isClaimLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Update Proof Contact
  updateProofContact(imprint) {
    let artAprrovalID;
    if (imprint.selectedContact == this.orderData.sessionArtwork_artApprovalContactID) {
      artAprrovalID = this.orderData.sessionArtwork_artApprovalContactID;
    } else {
      artAprrovalID = imprint.selectedContact.pk_artApprovalContactID;
    }
    imprint.isProofLoader = true;
    let payload: updateOrderProofContact = {
      artApproval_contact_id: artAprrovalID,
      orderline_id: Number(this.paramData.pk_orderLineID),
      imprint_id: Number(imprint.pk_imprintID),
      update_order_proof_contact: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
        if (imprint.selectedContact == this.orderData.sessionArtwork_artApprovalContactID) {
          imprint.selectedContactEmail = this.orderData.email;
          imprint.emailRecipients = this.orderData.email;
        } else {
          imprint.selectedContactEmail = imprint.selectedContact.email;
          imprint.emailRecipients = imprint.selectedContact.email;
        }
      }
      imprint.isProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.isProofLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }

  applyStatusChangeImprint(imprint, statusID, type) {
    if (imprint.blnRespond) {
      if (imprint.proofComments == '') {
        this._smartartService.snackBar('Please enter comments regarding this communication.');
        return;
      }
    }

    imprint.applyStatusLoader = false;
    if (type != 'apply') {
      if (statusID == 2) {
        imprint.pendingStatusLoader = true;
      } else if (statusID == 3) {
        imprint.awaitingStatusLoader = true;
      } else if (statusID == 4) {
        imprint.artworkStatusLoader = true;
      } else if (statusID == 5) {
        imprint.decoratorStatusLoader = true;
      } else if (statusID == 7) {
        imprint.proofStatusLoader = true;
      } else if (statusID == 9) {
        imprint.approveStatusLoader = true;
      } else if (statusID == 11) {
        imprint.productionStatusLoader = true;
      } else if (statusID == 12) {
        imprint.holdStatusLoader = true;
      } else if (statusID == 13) {
        imprint.followStatusLoader = true;
      } else if (statusID == 16) {
        imprint.poStatusLoader = true;
      } else if (statusID == 17) {
        imprint.waitingStatusLoader = true;
      }
    }
    let inhands;
    let blnApprove = 0;
    if (imprint.pk_statusID == 5 || imprint.pk_statusID == 6 || imprint.pk_statusID == 7 || imprint.pk_statusID == 9 || imprint.pk_statusID == 11 || imprint.pk_statusID == 16) {
      blnApprove = 1;
    } else {
      blnApprove = 0;
    }
    if (this.orderData.inHandsDate) {
      inhands = moment(this.orderData.inHandsDate).format('MM/DD/yyyy');
    } else {
      inhands = 'None';
    }
    let payload: SmartartImprintStatusUpdate = {
      orderLineID: Number(this.paramData.pk_orderLineID),
      imprintID: Number(imprint.pk_imprintID),
      userID: Number(this.paramData.pfk_userID),
      orderLineImprintID: Number(this.paramData.fk_imprintID),
      orderID: Number(this.paramData.fk_orderID),
      orderDate: moment(this.orderData.orderDate).format('MM/DD/YYYY'),
      inHandsDate: inhands,
      statusID: Number(statusID),
      storeID: Number(this.orderData.pk_storeID),
      storeName: this.orderData.storeName,
      blnRespond: imprint.blnRespond,
      blnGroupRun: this.orderData.blnGroupRun,
      proofComments: imprint.proofComments,
      blnApproved: blnApprove,
      smartArtLoggedInUserName: this.smartArtUser.firstName + ' ' + this.smartArtUser.lastName,
      update_smart_imprint_status: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._smartartService.snackBar(res["message"]);
        if (statusID == 9) {
          imprint.statusName = 'Artwork Approved';
        } else if (statusID == 2) {
          imprint.statusName = 'NEW PENDING';
        } else if (statusID == 3) {
          imprint.statusName = 'AWAITING ARTWORK APPROVAL';
        } else if (statusID == 4) {
          imprint.statusName = 'ARTWORK REVISION';
        } else if (statusID == 5) {
          imprint.statusName = 'DECORATOR NOTIFIED';
        } else if (statusID == 7) {
          imprint.statusName = 'NO PROOF NEEDED';
        } else if (statusID == 9) {
          imprint.statusName = 'ARTWORK APPROVED';
        } else if (statusID == 11) {
          imprint.statusName = 'IN PRODUCTION';
        } else if (statusID == 12) {
          imprint.statusName = 'ON HOLD';
        } else if (statusID == 13) {
          imprint.statusName = 'FOLLOW UP FOR APPROVAL';
        } else if (statusID == 16) {
          imprint.statusName = 'PO Sent';
        } else if (statusID == 17) {
          imprint.statusName = 'WAITING FOR GROUP ORDER';
        }
        imprint.pk_statusID = statusID;
        imprint.statusDate = moment().format('yyyy-MM-DD');
      }
      imprint.applyStatusLoader = false;
      imprint.pendingStatusLoader = false;
      imprint.awaitingStatusLoader = false;
      imprint.artworkStatusLoader = false;
      imprint.decoratorStatusLoader = false;
      imprint.proofStatusLoader = false;
      imprint.approveStatusLoader = false;
      imprint.productionStatusLoader = false;
      imprint.holdStatusLoader = false;
      imprint.followStatusLoader = false;
      imprint.poStatusLoader = false;
      imprint.waitingStatusLoader = false;
      imprint.blnRespond = false;
      imprint.proofComments = '';
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.applyStatusLoader = false;
      imprint.pendingStatusLoader = false;
      imprint.awaitingStatusLoader = false;
      imprint.artworkStatusLoader = false;
      imprint.decoratorStatusLoader = false;
      imprint.proofStatusLoader = false;
      imprint.approveStatusLoader = false;
      imprint.productionStatusLoader = false;
      imprint.holdStatusLoader = false;
      imprint.followStatusLoader = false;
      imprint.poStatusLoader = false;
      imprint.waitingStatusLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Update order Attention
  updateAttentionFlagOrder(item, check) {
    item.isFlagLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateAttentionFlagOrder = {
      bln_attention: check,
      orderline_id: Number(this.paramData.pk_orderLineID),
      imprint_id: Number(item.pk_imprintID),
      update_order_attention_flag: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      item.isFlagLoader = false;
      item.blnAttention = check;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.isFlagLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadArtworkFile(event) {
    this.imageArtworkValue = null;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const extension = type.split("/")[1]; // Extract the extension from the MIME type
      this.imageArtworkValue = {
        imageUpload: reader.result,
        type: extension
      };
    }
  };
  uploadArtworkFileToServer(imprint) {
    imprint.artworkProofLoader = true;
    if (this.imageArtworkValue) {
      let path;
      path = `/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}/${this.imageArtworkValue.extension}`;
      const base64 = this.imageArtworkValue.imageUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: path
      };
      this._smartartService.addMedia(payload)
        .subscribe((response) => {
          this.uploadArtworkProof(imprint);
          this._smartartService.snackBar('File Uploaded Successfully');
          this._changeDetectorRef.markForCheck();
        }, err => {
          imprint.artworkProofLoader = false;
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this.uploadArtworkProof(imprint);
    }
  }
  uploadArtworkProof(imprint) {
    let approvingStoreUserID = null;
    if (imprint.fk_storeUserApprovalContactID) {
      approvingStoreUserID = imprint.fk_storeUserApprovalContactID;
    } else if (imprint.fk_artApprovalContactID) {
      approvingStoreUserID = imprint.fk_artApprovalContactID;
    } else {
      approvingStoreUserID = imprint.fk_storeUserID;
    }
    let date = null;
    if (imprint.blnIncludeApproveByDate) {
      let datetime = new Date(imprint.artworkDate + ' ' + imprint.artworkTime);
      if (imprint.artworkDate && imprint.artworkTime) {
        date = moment(datetime).format('yyyy-MM-DD HH:mm:ss');
      } else {
        this._smartartService.snackBar('Please choose date & time');
        return;
      }
    }
    if (imprint.emailRecipients == '') {
      this._smartartService.snackBar('Please enter recipient email');
      return;
    }
    let payload: UploadOrderArtProof = {
      blnIncludeApproveByDate: imprint.blnIncludeApproveByDate,
      approveByDate: date,
      orderLineID: Number(this.paramData.pk_orderLineID),
      orderID: this.orderData.pk_orderID,
      imprintID: imprint.pk_imprintID,
      emailRecipients: imprint.emailRecipients,
      smartArtAdminEmail: this.smartArtUser.email,
      storeID: this.orderData.pk_storeID,
      storeName: this.orderData.storeName,
      storeURL: this.orderData.storeURL.toLowerCase(),
      storeCode: this.orderData.storeCode,
      protocol: this.orderData.protocol,
      productName: this.orderData.productName.replace(/'/g, "''"),
      productNumber: this.orderData.sessionArtwork_productNumber.replace(/'/g, "''"),
      storePrimaryHighlight: this.orderData.storePrimaryHighlight,
      inHandsDate: this.orderData.inHandsDate,
      blnGroupRun: this.orderData.blnGroupRun,
      storeProductID: this.orderData.pk_storeProductID,
      orderLineQuantity: this.orderData.quantity,
      methodName: imprint.decorationName,
      locationName: imprint.locationName,
      imprintColors: imprint.imprintColors,
      firstName: this.orderData?.firstName,
      lastName: this.orderData?.lastName,
      email: this.orderData.email,
      comment: imprint.recipientsComment,
      userID: Number(this.orderData.pfk_userID),
      approvingStoreUserID: approvingStoreUserID,
      companyName: this.orderData.sessionArtworkCompanyName,
      blnIgnoreAdditionalArtEmails: this.orderData.blnIgnoreAdditionalArtEmails,
      blnProofSent: imprint.blnProofSent,
      fk_artApprovalContactID: imprint.fk_artApprovalContactID,
      fk_storeUserApprovalContactID: imprint.fk_storeUserApprovalContactID,
      blnRespond: imprint.blnRespond,
      loggedInUserID: Number(this.smartArtUser.adminUserID),
      groupOrderID: this.orderData.fk_groupOrderID,
      upload_order_art_proof: true
    }
    this.artworkFileInput.nativeElement.value = '';
    this.imageArtworkValue = null;
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      imprint.artworkProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.artworkProofLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  sendOrderProofUpdates(imprint) {
    let payload: sendOrderProofUpdate = {
      imprintLocationName: imprint.locationName,
      imprintMethodName: imprint.decorationName,
      imprintID: Number(imprint.pk_imprintID),
      storeName: this.orderData.storeName,
      orderID: this.orderData.pk_orderID,
      storeID: this.orderData.sessionArtworkStoreID,
      productName: this.orderData.sessionArtwork_productName,
      storeUserID: this.orderData.fk_storeUserID,
      orderLineID: Number(this.paramData.pk_orderLineID),
      send_order_proof_update: true
    }
    imprint.senOrderProofLoader = true;
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      imprint.senOrderProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.senOrderProofLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }

  uploadFinalArtworkFile(event) {
    this.imageFinalArtworkValue = null;
    const file = event.target.files[0];
    let type = file["type"];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const extension = type.split("/")[1]; // Extract the extension from the MIME type
      this.imageFinalArtworkValue = {
        imageUpload: reader.result,
        type: extension
      };
    }
  };
  uploadFinalArtworkFileToServer(imprint) {
    if (this.imageFinalArtworkValue) {
      imprint.finalArtworkProofLoader = true;
      let path;
      path = `/artwork/finalart/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.${this.imageFinalArtworkValue.type}`;
      const base64 = this.imageFinalArtworkValue.imageUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: path
      };
      this._smartartService.addMedia(payload)
        .subscribe((response) => {
          this.uploadFinalArtworkProof(imprint);
          this._smartartService.snackBar('File Uploaded Successfully');
          this._changeDetectorRef.markForCheck();
        }, err => {
          imprint.finalArtworkProofLoader = false;
          this._changeDetectorRef.markForCheck();
        })
    } else {
      this._smartartService.snackBar('Please choose any file');
      // this.uploadFinalArtworkProof(imprint);
    }
  }
  uploadFinalArtworkProof(imprint) {
    if (imprint.emailRecipients == '') {
      imprint.finalArtworkProofLoader = false;
      this._smartartService.snackBar('Please enter recipient email');
      return;
    }
    let payload: UploadOrderFinalArt = {
      decoratorEmail: imprint.emailRecipients,
      clientFileExt: this.imageFinalArtworkValue.type, // file extension that is uploaded
      storeID: this.orderData.pk_storeID,
      storeName: this.orderData.storeName,
      orderID: this.orderData.pk_orderID,
      orderLineID: Number(this.paramData.pk_orderLineID),
      userID: Number(this.orderData.pfk_userID),
      orderLineImprintID: Number(this.paramData.fk_imprintID),
      decorationName: imprint.decorationName,
      locationName: imprint.locationName,
      productName: this.orderData.productName.replace(/'/g, "''"),
      artworkComments: imprint.finalArtworkComments,
      smartArtLoggedInName: this.smartArtUser.firstName + ' ' + this.smartArtUser.lastName,
      smartArtAdminEmail: this.smartArtUser.email,
      blnGroupRun: this.orderData.blnGroupRun,
      upload_order_final_art: true
    }
    this.finalArtworkFileInput.nativeElement.value = '';
    this.imageFinalArtworkValue = null;
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      imprint.finalArtworkProofLoader = false;
      imprint.pk_statusID = 5;
      imprint.statusName = "DECORATOR NOTIFIED";
      this.orderData.internalComments = this.orderData.internalComments + res["orderComment"];
      this._smartartService.snackBar(res["message"]);
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.finalArtworkProofLoader = false;
      this._changeDetectorRef.markForCheck();
    });
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
