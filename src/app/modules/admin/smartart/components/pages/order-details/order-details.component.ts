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
import { AddOrderComment, UpdateOrderLineArtworkTags, UpdateArtworkTgas, UpdateOrderInformation, sendAutoRequest, updateOrderLineImprintColors, updateReorderNumberOrder, UpdateOrderLineClaim, updateOrderProofContact, SmartartImprintStatusUpdate, sendAutoRequestOrder, updateAttentionFlagOrder, sendOrderProofUpdate, UploadOrderArtProof, UploadOrderFinalArt, updateOrderPurchaseOrderComment, uploadVirtualProof, removeVirtualProof } from '../../smartart.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./order-detail.scss']
})
export class OrderDashboardDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('outerDiv') outerDiv!: ElementRef;
  @ViewChild('scrollBottomComment') scrollBottomComment!: ElementRef;
  @ViewChild('commentsContainer', { static: false }) commentsContainer: ElementRef;

  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @ViewChild('artworkFileInput') artworkFileInput: ElementRef;
  @ViewChild('manualProofFileInput') manualProofFileInput: ElementRef;
  @ViewChild('finalArtworkFileInput') finalArtworkFileInput: ElementRef;
  @ViewChild('artworkPOFileInput') artworkPOFileInput: ElementRef;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  assetUrl = environment.assetsURL;
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
  selectedImprintForTimer: any;
  selectedImprint: any;
  selectedImprintColor = '';
  selectedMultipleColors: any;
  // Artwork templates
  artWorkLoader: boolean = false;
  artworktemplatesData: any;
  // Virtual Proof Images
  virtualProofData: any;
  // Approval History
  approvalHistoryData: any = [];
  // artwork tags
  artworkTags: any = [];

  // Timer
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  intervalId: any;
  isAutoRequestLoader: boolean;
  imageValue: any;
  imagePOValue: any;
  isManualProofLoader: boolean;
  selectedProofImprint: any;

  imprintColorsLoader: boolean = false;
  imprintPurchaseCommentLoader: boolean = false;
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
  selectedPOComments: any = '';

  imprintPMSColors = '';

  // Virtual Proof Images
  @ViewChild('virtualProofInput') virtualProofInput: ElementRef;
  virtualProofImageValue: any;
  VirtualProofImageLoader: boolean = false;

  userDetails: any;
  randomString: any = new Date().getTime();

  activeTooltip = '';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _commonService: DashboardsService,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userDetails = JSON.parse(localStorage.getItem('userDetails'));
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
      order_id: this.paramData.fk_orderID,
      imprint_id: this.paramData.fk_imprintID
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderData = res["data"][0];
      this.orderData.qryGroupRun = res["qryGroupRun"];
      this.orderData.blnStoreImage = true;
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
      this.imprintdata = res["data"];
      if (this.imprintdata.length > 0) {
        if (this.imprintdata[0].approvalHistory) {
          const approvals = this.imprintdata[0].approvalHistory.split(',,');
          approvals.forEach(approval => {
            const [name, date, blnStoreUserApproval, fk_approvalContactID, fk_storeUserApprovalContactID] = approval.split('::');
            let userApproval = true;
            if (blnStoreUserApproval == 0) {
              userApproval = false;
            }
            this.approvalHistoryData.push({ name, date, blnStoreUserApproval: userApproval, fk_approvalContactID, fk_storeUserApprovalContactID });
          });
        }
        this.orderData.artworkEmail = this.imprintdata[0].artworkEmail;
        this.selectedImprint = this.imprintdata[0].pk_imprintID;
        this.selectedImprintForTimer = this.imprintdata[0];
        this.selectedProofImprint = this.imprintdata[0].pk_imprintID;
        this.selectedPOComments = this.imprintdata[0].purchaseComment;
        if (this.imprintdata[0].colorNameList) {
          this.selectedMultipleColors = this.imprintdata[0].colorNameList.split(',');
        }
        this.imprintdata.forEach(imprint => {
          const url = `https://assets.consolidus.com/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${imprint.pk_imprintID}.jpg`
          this.checkIfImageExists(url, imprint)
          imprint.artworkFiles = [];
          imprint.artworkPOFiles = null;
          imprint.artworkFinalartFiles = [];
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
          if (res["poSent"]) {
            if (res["poSent"].length) {
              if (imprint.pk_statusID >= 5) {
                imprint.poSent = res["poSent"][0];
              } else {
                imprint.poSent = null;
              }
            }
          }
          // Pack and accessories
          imprint.packAccessories = [];
          if (imprint.qryOrderLineAccessoriesReport) {
            const accessories = imprint.qryOrderLineAccessoriesReport.split(',,');
            accessories.forEach(packs => {
              const [quantity, packagingName] = packs.split('::');
              imprint.packAccessories.push({ quantity, packagingName });
            });
          }
        });
      }
      const checkFileExistObservable = of(this.checkFileExist(`https://assets.consolidus.com/globalAssets/Stores/BrandGuide/${this.orderData.pk_storeID}.pdf`, 'brand', 0));
      const checkFinalArtworkObservable = of(this.checkFileExist(`https://assets.consolidus.com/artwork/finalArt/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.eps`, 'finalArtwork', 0));
      const getArtworkOtherObservable = of(this.getArtworkOther());
      // const checkIfImageExistsObservable = of(this.checkIfImageExists(`https://assets.consolidus.com/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.jpg`));
      const getArtworkFiles = of(this.getArtworkFiles());
      const getArtworkPOFiles = of(this.getArtworkPOProofFiles());
      const getArtworkFinalartFiles = of(this.getArtworkFinalartFiles());
      forkJoin([
        checkFileExistObservable,
        checkFinalArtworkObservable,
        getArtworkOtherObservable,
        // checkIfImageExistsObservable,
        getArtworkPOFiles,
        getArtworkFinalartFiles,
        getArtworkFiles
      ])

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
      }
      // Assign email recipients
      this.imprintdata.forEach(imprint => {
        // let status = imprint.pk_statusID;
        imprint.artworkPO = this.orderData.fk_orderID + '-' + this.paramData?.pk_orderLineID;
        // imprint.blnIncludeApproveByDate = false;
        imprint.artworkDate = '';
        imprint.artworkTime = '';
        if (imprint.formattedApproveByDate) {
          let date = imprint.formattedApproveByDate.split('|||');
          imprint.artworkDate = date[0];
          imprint.artworkTime = date[1];
        }
        imprint.proofComments = '';
        imprint.statusID = 9;
        imprint.emailRecipients = '';
        imprint.recipientsComment = '';
        // set Imprint Quantity
        this.setitemColorsWithIDs(imprint);

        if (this.orderData.blnApparel) {
          this.setImprintQTYToast(imprint);
        }
        // Set Imprint Color
        imprint.bgColor = this.setImprintColor(imprint.pk_statusID);
        // NEW PENDING

        if (imprint.pk_statusID == 2) {
          imprint.recipientsComment = 'Please double check all details of this proof for accuracy.  (ie. phone numbers, email/addresses, websites).';
          if (imprint.fk_artApprovalContactID || (imprint.fk_artApprovalContactID && !imprint.blnStoreUserApprovalDone)) {
            imprint.emailRecipients = this.orderData.proofEmail;
            this._changeDetectorRef.markForCheck();
          } else {
            // session.artwork.email
            if (this.orderData.sessionProofEmails.length > 0) {
              imprint.emailRecipients = this.orderData.sessionProofEmails.toString();
              this._changeDetectorRef.markForCheck();
            } else {
              imprint.emailRecipients = this.orderData.sessionArtworkEmail;
            }

            // imprint.emailRecipients = this.orderData.sessionArtworkEmail;
            this._changeDetectorRef.markForCheck();
          }
        }
        // AWAITING ARTWORK APPROVAL || ON-HOLD || FOLLOW UP FOR APPROVAL
        else if (imprint.pk_statusID == 3 || imprint.pk_statusID == 12 || imprint.pk_statusID == 13) {
          if ((imprint?.fk_artApprovalContactID || imprint?.fk_storeUserApprovalContactID) && !imprint?.blnStoreUserApprovalDone) {
            imprint.emailRecipients = imprint.proofContactEmail;
            this._changeDetectorRef.markForCheck();
          } else {
            // session.artwork.email
            if (this.orderData.sessionProofEmails.length > 0) {
              imprint.emailRecipients = this.orderData.sessionProofEmails.toString();
              this._changeDetectorRef.markForCheck();
            } else {
              imprint.emailRecipients = this.orderData.sessionArtworkEmail;
            }
            // imprint.emailRecipients = this.orderData.sessionArtworkEmail;
            this._changeDetectorRef.markForCheck();
          }
        }
        // ARTWORK REVISION 
        else if (imprint.pk_statusID == 4) {
          imprint.recipientsComment = 'Please double check all details of this proof for accuracy.  (ie. phone numbers, email/addresses, websites).';
          this._changeDetectorRef.markForCheck();
        }
        // DECORATOR NOTIFIED || IN PRODUCTION || PO Sent
        else if (imprint.pk_statusID == 5 || imprint.pk_statusID == 11 || imprint.pk_statusID == 16) {
          // session.artwork.decoratorEmail#
          imprint.emailRecipients = this.orderData.sessionArtwork_artworkEmail;
          this._changeDetectorRef.markForCheck();
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
            this.orderData.artworkEmail = imprint;
          } else if (imprint.decorationName.toLowerCase().includes('embroid')) {
            imprint.selectedContactEmail = imprint.embroideryEmail;
          } else {
            imprint.selectedContactEmail = imprint.artworkEmail;
          }
          this.orderData.artworkEmail = imprint.selectedContactEmail;
          this._changeDetectorRef.markForCheck();
        } else {
          imprint.selectedContact = null;
          if (imprint.decorationName.toLowerCase().includes('screen')) {
            imprint.selectedContactEmail = imprint.screenprintEmail;
            this.orderData.artworkEmail = imprint
            imprint.emailRecipients = imprint.selectedContactEmail;
          } else if (imprint.decorationName.toLowerCase().includes('embroid')) {
            imprint.selectedContactEmail = imprint.embroideryEmail;
            imprint.emailRecipients = imprint.selectedContactEmail;
          } else {
            imprint.selectedContactEmail = imprint.artworkEmail;
          }
          this.orderData.artworkEmail = imprint.selectedContactEmail;
          this._changeDetectorRef.markForCheck();
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
          this._changeDetectorRef.markForCheck();
        });
        this.contactProofs = res["contactProofs"];
      }
      this.artWorkLoader = false;
      this.isLoading = false;
      this.scrollToComments()
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.artWorkLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  setitemColorsWithIDs(imprint) {
    imprint.itemColorsWithIDsData = [];
    if (imprint.itemColorsWithIDs) {
      let colors = imprint.itemColorsWithIDs.split(',,');
      colors.forEach(color => {
        const [id, name] = color.split('::');
        let image = false;
        this.checkImageExist(`https://assets.consolidus.com/globalAssets/Products/Colors/${this.orderData.fk_productID}/${id}.jpg`).then(res => {
          if (res) {
            image = true;
          }
          imprint.itemColorsWithIDsData.push({ id, name, image });
        })
      });
    }
  }
  setImprintQTYToast(imprint) {
    if (imprint.qryOrderLineItemReport) {
      let items = imprint.qryOrderLineItemReport.split(',,');
      imprint.qryOrderLineItemReportData = [];
      items.forEach(element => {
        const [quantity, name, size] = element.split('::');
        imprint.qryOrderLineItemReportData.push({ quantity, name, size });
      });
    }
    this._changeDetectorRef.markForCheck();
  }
  setImprintColor(pk_statusID) {
    const statusColorMap = {
      2: '#FF9999',
      4: '#FF9999',
      9: '#FF9999',
      16: '#FF9999',
      3: '#99FF99',
      5: '#99FF99',
      7: '#99FF99',
      11: '#99FF99',
      12: '#99FF99',
      13: '#99FF99',
      17: '#99FF99',
      // Add more mappings as needed
    };

    return statusColorMap[pk_statusID] || '';
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
  getArtworkFinalartFiles() {
    let payload = {
      files_fetch: true,
      path: `artwork/finalArt/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._smartartService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.imprintdata.forEach(element => {
        files["data"].forEach(file => {
          if (file.ID.includes(element.pk_imprintID)) {
            element.artworkFinalartFiles.push(file);
          }
        });
      });

      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  getArtworkPOProofFiles() {
    let payload = {
      files_fetch: true,
      path: `/artwork/POProof/${this.paramData.pk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._smartartService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.imprintdata.forEach(element => {
        element.artworkPOFiles = files["data"][0];
      });
      // this.imprintdata[index].artworkFiles = files["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  removePOFiles(imprint) {
    imprint.removeLoader = true;
    let payload = {
      files: [`/artwork/POProof/${this.paramData.pk_orderLineID}/${imprint.artworkPOFiles.FILENAME}`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload)
      .subscribe((response) => {
        this._smartartService.snackBar('PO artwork successfully removed.');
        this.imprintdata.forEach(element => {
          element.artworkPOFiles = null;
        });
        imprint.removeLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        imprint.removeLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  uploadPOFile(event): void {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const fileName = file.name;
        const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);

        // Check file type based on extension
        let fileType;
        if (['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension.toLowerCase())) {
          fileType = 'image';
        } else if (['eps', 'ai'].includes(fileExtension.toLowerCase())) {
          fileType = 'vector';
        } else if (fileExtension.toLowerCase() === 'pdf') {
          fileType = 'pdf';
        } else {
          fileType = 'unknown';
        }

        // Handle different file types accordingly
        switch (fileType) {
          case 'image':
            let image: any = new Image();
            image.src = reader.result;
            image.onload = () => {
              this.imagePOValue = {
                imageUpload: reader.result,
                type: file.type,
                extension: fileExtension,
                fileType: 'image',
              };
            };
            break;

          case 'vector':
            // Handle vector file logic
            this.imagePOValue = {
              imageUpload: reader.result,
              type: file.type,
              extension: fileExtension,
              fileType: 'vector',
            };
            break;

          case 'pdf':
            // Handle PDF file logic
            this.imagePOValue = {
              imageUpload: reader.result,
              type: file.type,
              extension: fileExtension,
              fileType: 'pdf',
            };
            break;

          default:
            // Handle unknown file type logic
            console.error('Unsupported file type');
            break;
        }
      };

      if (file) {
        reader.readAsDataURL(file);
      }
    }

  };
  uploadPOFilesServer(imprint) {
    if (!this.imagePOValue) {
      this._smartartService.snackBar('Please choose any file.');
      return;
    }
    imprint.uploadPOLoader = true;
    let files = [];
    let filePath = `artwork/POProof/${this.paramData.pk_orderLineID}/${imprint.pk_olImprintID}.${this.imagePOValue.extension}`;
    files.push({
      image_file: this.imagePOValue.imageUpload.split(",")[1],
      image_path: filePath
    });
    this._commonService.uploadMultipleMediaFiles(files).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.artworkPOFileInput.nativeElement.value = '';
      this.getArtworkPOProofFiles();
      this._smartartService.snackBar('PO artwork successfully uploaded.');
      imprint.uploadPOLoader = false;
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
      internalComments: this.ngComment.replace(/'/g, "''"),
      order_id: this.paramData.fk_orderID,
      add_order_comment: true
    }
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let comment = res["comment"];
      this.orderData.internalComments = this.orderData.internalComments + comment;
      this.scrollToComments();
      this.ngComment = ''
      // setTimeout(() => {
      //   const element = document.getElementById('scrollBottomComment');
      //   element.scrollIntoView({ behavior: 'smooth' });
      //   this._changeDetectorRef.markForCheck();
      //   this.ngComment = '';
      // }, 100);
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
    this.imprintPMSColors = '';
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
      if (imprint[0].colorNameList) {
        this.selectedMultipleColors = imprint[0].colorNameList.split(',');
        this.selectedPOComments = this.imprintdata[0].purchaseComment;
      }
    }
  }
  onChangePurchaseComments(event) {
    let imprint = this.imprintdata.filter(item => item.pk_imprintID == event.value);
    this.selectedImprint = imprint[0].pk_imprintID;
    this.selectedPOComments = imprint[0].purchaseComment;
    this._changeDetectorRef.markForCheck();
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
      this.imprintdata[index].imprintComments = this.imprintdata[index].imprintComments + ' <br>' + res["customerComment"];
      this.orderData.internalComments = this.orderData.internalComments + ' <br>' + res["comment"];
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
    const img_path = `artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.selectedProofImprint}.jpg`;
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };
    this._smartartService.AddSmartArtData(payload).subscribe(res => {
      this.imageValue = null;
      let index = this.imprintdata.findIndex(item => item.pk_imprintID == this.selectedProofImprint);
      this.imprintdata[index].viewProofCheck = true;
      if (res["success"]) {
        this._smartartService.snackBar('Artwork proof updated successfully');
      }
      this.manualProofFileInput.nativeElement.value = '';
      this.isManualProofLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isManualProofLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Updarte Purchase Comments
  updatePurchaseComments() {
    this.imprintPurchaseCommentLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateOrderPurchaseOrderComment = {
      purchaseOrderComment: this.selectedPOComments,
      orderLineID: Number(this.paramData.pk_orderLineID),
      imprintID: this.selectedImprint,
      update_order_purchase_comment: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        const index = this.imprintdata.findIndex(item => item.pk_imprintID == this.selectedImprint);
        this.imprintdata[index].purchaseComment = this.selectedPOComments;
        this._smartartService.snackBar(res["message"]);
      }
      this.imprintPurchaseCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.imprintPurchaseCommentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Imprint Colors
  updateOrderLineImprintColors() {
    let colors = this.selectedMultipleColors;
    if (this.imprintPMSColors) {
      colors.push(this.imprintPMSColors);
    }
    this.imprintColorsLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateOrderLineImprintColors = {
      imprintColors: this.selectedMultipleColors.toString(),
      productName: this.orderData.productName.replace(/'/g, "''"),
      orderID: this.orderData.pk_orderID,
      orderline_id: Number(this.paramData.pk_orderLineID),
      imprint_id: this.selectedImprint,
      update_order_imprint_colors: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        const index = this.imprintdata.findIndex(item => item.pk_imprintID == this.selectedImprint);
        this.imprintdata[index].colorNameList = this.selectedMultipleColors.toString();
        this.imprintdata[index].imprintColors = this.selectedMultipleColors.toString();
        this.imprintPMSColors = '';
        this.orderData.internalComments = this.orderData.internalComments + res["comment"];
        // setTimeout(() => {
        //   const element = document.getElementById('scrollBottomComment');
        //   element.scrollIntoView({ behavior: 'smooth' });
        //   this._changeDetectorRef.markForCheck();
        //   this.ngComment = '';
        // }, 100);
        this.scrollToComments();
        this.ngComment = '';
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
  checkIfImageExists(url, imprint) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        imprint.viewProofCheck = true;
        this.viewProofCheck = true;
      };

      img.onerror = () => {
        imprint.viewProofCheck = false;
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
      claimID = Number(this.userDetails.pk_userID)
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
  applyStatusChangeImprint(imprint, statusID, type) {
    const url = `https://assets.consolidus.com/globalAssets/Products/HiRes/${this.orderData.pk_storeProductID}.jpg?${this.randomString}`;
    let storeImage: any = '';
    this.checkImageExist(url).then(imgRes => {
      if (imgRes) {
        storeImage = url;
      } else {
        storeImage = 'https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg';
      }
      let index = this.imprintdata.findIndex(imp => imp.pk_imprintID == imprint.pk_imprintID)
      if (statusID == 9) {
        if (imprint.blnRespond) {
          if (imprint.proofComments == '') {
            this._smartartService.snackBar('Please enter comments regarding this communication.');
            return;
          }
        }
      }
      imprint.applyStatusLoader = false;
      if (type != 'apply') {
        if (statusID == 2) {
          imprint.pendingStatusLoader = true;
          imprint.recipientsComment = 'Please double check all details of this proof for accuracy.  (ie. phone numbers, email/addresses, websites).';
        } else if (statusID == 3) {
          imprint.awaitingStatusLoader = true;
        } else if (statusID == 4) {
          imprint.artworkStatusLoader = true;
          imprint.recipientsComment = 'Please double check all details of this proof for accuracy.  (ie. phone numbers, email/addresses, websites).';
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
      } else {
        imprint.applyStatusLoader = true;
      }
      let inhands;
      let orderDate;
      const validStatusIDs = [5, 6, 7, 9, 11, 16];
      let blnApprove = validStatusIDs.includes(imprint.pk_statusID) ? true : false;
      if (this.orderData.inHandsDate) {
        inhands = moment(this.orderData.inHandsDate).format('MM/DD/yyyy');
      } else {
        inhands = 'None';
      }
      let approvingStoreUserID = null;
      if (imprint.fk_storeUserApprovalContactID) {
        approvingStoreUserID = imprint.fk_storeUserApprovalContactID;
      } else if (imprint.fk_artApprovalContactID) {
        approvingStoreUserID = imprint.fk_artApprovalContactID;
      } else {
        approvingStoreUserID = this.orderData.fk_storeUserID;
      }

      this._changeDetectorRef.markForCheck();
      let payload: SmartartImprintStatusUpdate = {
        orderLineID: Number(this.paramData.pk_orderLineID),
        imprintID: Number(imprint.pk_imprintID),
        userID: Number(this.paramData.pfk_userID),
        orderLineImprintID: Number(this.paramData.fk_imprintID),
        orderID: Number(this.paramData.fk_orderID),
        orderDate: this.orderData.orderDate,
        inHandsDate: inhands,
        statusID: Number(statusID),
        storeID: Number(this.orderData.pk_storeID),
        storeName: this.orderData.storeName,
        storeCode: this.orderData.storeCode,
        protocol: this.orderData.protocol,
        storeURL: this.orderData.storeURL,
        blnRespond: imprint.blnRespond,
        blnGroupRun: this.orderData.blnGroupRun,
        proofComments: imprint.proofComments,
        blnApproved: blnApprove,
        smartArtLoggedInUserName: this.smartArtUser.firstName + ' ' + this.smartArtUser.lastName,
        blnAdditionalArtApproval: false,
        blnAdditionalApprovalOverride: false,
        storePrimaryHighlight: this.orderData.storePrimaryHighlight,
        billingStudentOrgCode: this.orderData.sessionArtworkBillingStudentOrgCode,
        imprintsCount: this.imprintdata.length,
        storeProductImage: storeImage,
        blnIgnoreAdditionalArtEmails: this.orderData.sessionArtwork_blnIgnoreAdditionalArtEmails,
        blnProofSent: imprint.blnProofSent,
        fk_artApprovalContactID: approvingStoreUserID,
        fk_storeUserApprovalContactID: imprint.fk_storeUserApprovalContactID,
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
        this.orderData.internalComments = this.orderData.internalComments + res["orderComment"];
        if (res["customerArtworkComment"]) {
          // this.imprintdata[index].imprintComments = this.imprintdata[index].imprintComments + ' <br>' + res["customerArtworkComment"];
        }
        if (statusID == 9) {
          if (imprint.viewProofCheck) {
            this.removeProofArtImage(imprint);
          }
        }
        this.updateImprintsData();
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
    });
  }
  mouseEnter(ev: any) {
    this.activeTooltip = ev.target.id;
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
    const img = new Image();
    img.src = `${environment.assetsURL}globalAssets/Products/HiRes/${this.orderData.pk_storeProductID}.jpg`;
    img.onload = () => {
      imprint.thumbnailURL = `${environment.assetsURL}globalAssets/Products/HiRes/${this.orderData.pk_storeProductID}.jpg`;
      return;
    };

    img.onerror = () => {
      imprint.thumbnailURL = `https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg`;
      return;
    };
    imprint.artworkProofLoader = true;
    if (this.imageArtworkValue) {
      if (imprint.viewProofCheck) {
        this.removeProofArtImage(imprint);
      } else {
        this.uploadProofArtDelCheck(imprint);
      }
    } else {
      this.uploadArtworkProof(imprint);
    }
  }
  removeProofArtImage(imprint) {
    let payload = {
      files: [`/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${imprint.pk_imprintID}.jpg`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload)
      .subscribe((response) => {
        this.uploadProofArtDelCheck(imprint);
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._changeDetectorRef.markForCheck();
      });
  }
  uploadProofArtDelCheck(imprint) {
    let path;
    path = `/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${imprint.pk_imprintID}.jpg`;
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
  }
  uploadArtworkProof(imprint) {
    let approvingStoreUserID = null;
    if (imprint.fk_storeUserApprovalContactID) {
      approvingStoreUserID = imprint.fk_storeUserApprovalContactID;
    } else if (imprint.fk_artApprovalContactID) {
      approvingStoreUserID = imprint.fk_artApprovalContactID;
    } else {
      approvingStoreUserID = this.orderData.fk_storeUserID;
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
      thumbnailImage: imprint.thumbnailURL,
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
      comment: imprint.recipientsComment.replace(/'/g, "''"),
      userID: Number(this.orderData.pfk_userID),
      approvingStoreUserID: approvingStoreUserID,
      companyName: this.orderData.sessionArtworkCompanyName,
      blnIgnoreAdditionalArtEmails: this.orderData.blnIgnoreAdditionalArtEmails,
      blnProofSent: imprint.blnProofSent,
      fk_artApprovalContactID: imprint.fk_artApprovalContactID,
      fk_storeUserApprovalContactID: imprint.fk_storeUserApprovalContactID,
      blnRespond: imprint.blnRespond,
      // loggedInUserID: Number(this.smartArtUser.adminUserID),
      loggedInUserID: Number(this.userDetails.pk_userID),
      groupOrderID: this.orderData.fk_groupOrderID,
      upload_order_art_proof: true
    }
    this.artworkFileInput.nativeElement.value = '';
    this.imageArtworkValue = null;
    let index = this.imprintdata.findIndex(imp => imp.pk_imprintID == imprint.pk_imprintID)
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      imprint.artworkProofLoader = false;
      imprint.statusName = 'Awaiting Artwork Approval';
      imprint.pk_statusID = 3;
      imprint.imprintComments = imprint.imprintComments + ' <br>' + res["customerComment"];
      this.orderData.internalComments = this.orderData.internalComments + res["orderComment"];
      imprint.bgColor = this.setImprintColor(imprint.pk_statusID);
      // console.log(imprint);
      this._smartartService.snackBar(res["message"]);
      this.updateImprintsData();
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
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const fileName = file.name;
      const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
      // const extension = type.split("/")[1]; // Extract the extension from the MIME type
      this.imageFinalArtworkValue = {
        imageUpload: reader.result,
        type: file.type,
        extension: fileExtension
      };
    }
  };
  uploadFinalArtworkFileToServer(imprint, msg) {
    if (this.imageFinalArtworkValue) {
      imprint.finalArtworkProofLoader = true;
      let path;
      path = `/artwork/finalart/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${this.paramData.fk_imprintID}.${this.imageFinalArtworkValue.extension}`;
      const base64 = this.imageFinalArtworkValue.imageUpload.split(",")[1];
      const payload = {
        file_upload: true,
        image_file: base64,
        image_path: path
      };
      this._smartartService.addMedia(payload)
        .subscribe((response) => {
          if (msg) {
            this._smartartService.snackBar(msg);
            this.getArtworkFinalartFiles();
          } else {
            this.uploadFinalArtworkProof(imprint);
            this._smartartService.snackBar('File Uploaded Successfully');
          }
          imprint.finalArtworkProofLoader = false;
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
      decoratorEmail: imprint.emailRecipients.split(','),
      clientFileExt: this.imageFinalArtworkValue.extension, // file extension that is uploaded
      storeID: this.orderData.pk_storeID,
      storeName: this.orderData.storeName,
      orderID: this.orderData.pk_orderID,
      userID: this.orderData.fk_storeUserID,
      orderLineImprintID: imprint.pk_imprintID,
      orderLineID: Number(this.paramData.pk_orderLineID),
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


  updateImprintsData() {
    // Assign email recipients
    this.imprintdata.forEach(imprint => {
      // let status = imprint.pk_statusID;
      // let status = imprint.pk_statusID;
      imprint.artworkPO = this.orderData.fk_orderID + '-' + this.paramData?.pk_orderLineID;
      // imprint.blnIncludeApproveByDate = false;
      imprint.artworkDate = '';
      imprint.artworkTime = '';
      if (imprint.formattedApproveByDate) {
        let date = imprint.formattedApproveByDate.split('|||');
        imprint.artworkDate = date[0];
        imprint.artworkTime = date[1];
      }
      imprint.proofComments = '';
      imprint.statusID = 9;
      imprint.emailRecipients = '';
      imprint.recipientsComment = '';
      this.setitemColorsWithIDs(imprint);
      // Set Imprint Quantity Toast
      if (this.orderData.blnApparel) {
        this.setImprintQTYToast(imprint);
      }

      // Set Imprint Color
      imprint.bgColor = this.setImprintColor(imprint.pk_statusID);

      // NEW PENDING

      if (imprint.pk_statusID == 2) {
        imprint.recipientsComment = 'Please double check all details of this proof for accuracy.  (ie. phone numbers, email/addresses, websites).';
        if (imprint.fk_artApprovalContactID || (imprint.fk_artApprovalContactID && !imprint.blnStoreUserApprovalDone)) {
          imprint.emailRecipients = this.orderData.proofEmail;
        } else {
          // session.artwork.email
          if (this.orderData.sessionProofEmails.length > 0) {
            imprint.emailRecipients = this.orderData.sessionProofEmails.toString();
          } else {
            imprint.emailRecipients = this.orderData.sessionArtworkEmail;
          }
          this._changeDetectorRef.markForCheck();
        }
      }
      // AWAITING ARTWORK APPROVAL || ON-HOLD || FOLLOW UP FOR APPROVAL
      else if (imprint.pk_statusID == 3 || imprint.pk_statusID == 12 || imprint.pk_statusID == 13) {
        if ((imprint?.fk_artApprovalContactID || imprint?.fk_storeUserApprovalContactID) && !imprint?.blnStoreUserApprovalDone) {
          imprint.emailRecipients = imprint.proofContactEmail;
        } else {
          // session.artwork.email
          if (this.orderData.sessionProofEmails.length > 0) {
            imprint.emailRecipients = this.orderData.sessionProofEmails.toString();
          } else {
            imprint.emailRecipients = this.orderData.sessionArtworkEmail;
          }
          this._changeDetectorRef.markForCheck();
        }
      }
      // ARTWORK REVISION 
      else if (imprint.pk_statusID == 4) {
      }
      // DECORATOR NOTIFIED || IN PRODUCTION || PO Sent
      else if (imprint.pk_statusID == 5 || imprint.pk_statusID == 11 || imprint.pk_statusID == 16) {
        // session.artwork.decoratorEmail#
        imprint.emailRecipients = this.orderData.sessionArtwork_artworkEmail;
        this._changeDetectorRef.markForCheck();
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
          this.orderData.artworkEmail = imprint;
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
          imprint.emailRecipients = imprint.selectedContactEmail;
        } else if (imprint.decorationName.toLowerCase().includes('embroid')) {
          imprint.selectedContactEmail = imprint.embroideryEmail;
          imprint.emailRecipients = imprint.selectedContactEmail;
        } else {
          imprint.selectedContactEmail = imprint.artworkEmail;
        }
        this.orderData.artworkEmail = imprint.selectedContactEmail;
      }
      const url = `https://assets.consolidus.com/artwork/Proof/${this.paramData.pfk_userID}/${this.paramData.fk_orderID}/${this.paramData.pk_orderLineID}/${imprint.pk_imprintID}.jpg`
      this.checkIfImageExists(url, imprint)
    });
    // Contact Proof
    if (this.contactProofs) {
      this.contactProofs.forEach(element => {
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
    }
  }
  // Upload Files
  uploadFilesCommonFn(event, type): void {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      if (file)
        reader.readAsDataURL(file);
      reader.onload = () => {
        let image: any = new Image;
        image.src = reader.result;
        image.onload = () => {
          const fileName = file.name;
          const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
          if (type == 'virtualProof') {
            if (image.width < 600 || image.height > 1500 || image.width > 1500 || image.height < 600) {
              this._smartartService.snackBar("Virtual proof images must be at least 600px by 600px, but no larger than 1500px by 1500px. The larger the better. JPG format only.");
              this.virtualProofImageValue = null;
              this.virtualProofInput.nativeElement.value = '';
              this._changeDetectorRef.markForCheck();
              return;
            };
            this.virtualProofImageValue = {
              imageUpload: reader.result,
              type: file.type,
              extension: fileExtension,
            };
          }
        }
      }
    }
  };
  uploadImagesToServerCommon(paths, type) {
    let files = [];
    if (type == 'virtualProof') {
      paths.forEach(path => {
        files.push({
          image_file: this.virtualProofImageValue.imageUpload.split(",")[1],
          image_path: path
        });
      });
    }
    this._commonService.uploadMultipleMediaFiles(files).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.virtualProofInput.nativeElement.value = '';
      this.getArtworkPOProofFiles();
      if (type == 'virtualProof') {
        this.getArtworkOther();
        this._smartartService.snackBar('Virtual proof uploaded successfully.');
        this.virtualProofImageValue = null;
        this.VirtualProofImageLoader = false;
      }
      this._changeDetectorRef.markForCheck();
    });
  }
  removeCommonFiles(paths, type) {
    let payload = {
      files: paths,
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload)
      .subscribe((response) => {
        if (type == 'virtualProof') {

        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._changeDetectorRef.markForCheck();
      });
  }
  // Upload Virtual Proof 
  uploadVirtualProof() {
    if (!this.virtualProofImageValue) {
      this._smartartService.snackBar('Virtual Proof Image is required');
      return;
    }
    this.VirtualProofImageLoader = true;
    let payload: uploadVirtualProof = {
      storeProductID: this.orderData.pk_storeProductID,
      blnStore: this.orderData.blnStoreImage ? this.orderData.blnStoreImage : false,
      upload_virtual_proof: true
    }
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        let paths = [`globalAssets/StoreProducts/VirtualProofs/${this.orderData.pk_storeProductID}/${res["newVirtualProofID"]}.jpg`, `globalAssets/StoreUsers/VirtualProofs/${this.orderData.fk_storeUserID}/${this.orderData.pk_orderID}/${this.paramData.pk_orderLineID}/${res["newVirtualProofID"]}.jpg`];
        this.uploadImagesToServerCommon(paths, 'virtualProof');
      } else {
        this.VirtualProofImageLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.VirtualProofImageLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removeVirtualProof(item) {
    item.removeLoader = true;
    let payload: removeVirtualProof = {
      virtualProofID: item.pk_virtualProofID,
      remove_virtual_proof: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        let paths = [`/globalAssets/StoreProducts/VirtualProofs/${this.orderData.pk_storeProductID}/${item.pk_virtualProofID}.jpg`];
        this.virtualProofData = this.virtualProofData.filter(proof => proof.pk_virtualProofID != item.pk_virtualProofID);
        this.removeCommonFiles(paths, 'virtualProof');
        this._smartartService.snackBar(res["message"]);
      }
      item.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // In Production and Decorator Notified Update FinalArt
  updateFinalArtFile(imprint) {
    if (!this.imageFinalArtworkValue) {
      this._smartartService.snackBar('Please select an image file.');
      return;
    }
    let payload: UploadOrderFinalArt = {
      decoratorEmail: imprint.emailRecipients.split(','),
      clientFileExt: this.imageFinalArtworkValue.extension, // file extension that is uploaded
      storeName: this.orderData.storeName,
      storeID: this.orderData.storeID,
      orderID: Number(this.paramData.fk_orderID),
      orderLineID: Number(this.paramData.pk_orderLineID),
      userID: this.orderData.fk_storeUserID,
      orderLineImprintID: imprint.pk_imprintID,
      decorationName: imprint.decorationName,
      locationName: imprint.locationName,
      productName: this.orderData.sessionArtwork_productName,
      artworkComments: imprint.artworkCommentsText.replace(/'/g, "''"),
      smartArtLoggedInName: this.smartArtUser.firstName + ' ' + this.smartArtUser.lastName,
      smartArtAdminEmail: this.smartArtUser.email,
      blnGroupRun: this.orderData.blnGroupRun,
      upload_order_final_art: true
    }
    imprint.finalArtworkProofLoader = true;
    this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        imprint.pk_statusID = 5;
        imprint.statusName = 'Decorator Notified';
        imprint.statusDate = res["currentDate"];
        this.orderData.internalComments = this.orderData.internalComments + res['orderComment'];
        this.imprintdata.forEach(element => {
          element.artworkFinalartFiles = [];
        });
        imprint.artworkCommentsText = '';
        this.uploadFinalArtworkFileToServer(imprint, 'Final artwork successfully uploaded, and decorator has been notified.');
        this.updateImprintsData();
      } else {
        imprint.finalArtworkProofLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      imprint.finalArtworkProofLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  scrollToComments() {
    setTimeout(() => {
      const outerContainer = document.getElementById('outerContainer'); // Replace 'outerContainer' with the ID of your outer container
      const innerDiv = document.getElementById('scrollBottomComment');

      // Calculate the offset of the inner div relative to the outer container
      const offset = innerDiv.offsetTop - outerContainer.offsetTop;

      // Scroll only the inner div
      outerContainer.scrollTop = offset;

      // Optionally, you can add smooth scrolling using CSS
      innerDiv.style.scrollBehavior = 'smooth';

      // const element = document.getElementById('scrollBottomComment');
      // element.scrollIntoView({ behavior: 'smooth' });
      this._changeDetectorRef.markForCheck();
    }, 500);
  }
  // Remove ApprovalHistory
  removeApprovalHistory(item) {
    item.removeApproveLoader = true;
    let storeUserID;
    let approvalID;
    if (item.blnStoreUserApproval) {
      approvalID = null;
      storeUserID = Number(item.fk_storeUserApprovalContactID);
    } else {
      storeUserID = null;
      approvalID = Number(item.fk_approvalContactID);
    }
    let payload = {
      orderline_id: Number(this.paramData.pk_orderLineID),
      imprint_id: Number(this.paramData.fk_imprintID),
      blnStoreUserApproval: item.blnStoreUserApproval,
      storeUserApprovalContactID: storeUserID,
      approvalContactID: approvalID,
      remove_order_approval_history: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      item.removeApproveLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.approvalHistoryData = this.approvalHistoryData.filter(approval => approval.name != item.name);
      this._smartartService.snackBar(res["message"]);
    });
  }

}
