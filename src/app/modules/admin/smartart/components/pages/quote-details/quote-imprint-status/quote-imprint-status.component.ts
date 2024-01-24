import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import moment from 'moment';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { SmartArtService } from '../../../smartart.service';
import { AddSmartArtCartComment, sendAutoRequest, UpdateArtworkTgas, updateImprintColors, UpdateQuoteClaim, updateQuoteImprintTime, UpdateQuoteOptions, updateQuoteProofContact, updateQuotePurchaseOrderComment, updateReorderNumber, UploadQuoteArtProof } from '../../../smartart.types';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-quote-imprint-status',
  templateUrl: './quote-imprint-status.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class QuoteImprintStatusComponent implements OnInit, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('drawer', { static: true }) drawer: MatDrawer;
  @Input() isLoading: boolean;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  userData: any;
  @Input() dataForNewComponent: any;
  quoteData: any;
  quoteImprintdata: any;
  paramData: any;
  smartArtUser: any;
  artworktemplatesData: any;
  contactProofs: any;

  isCommentToggle: boolean = false;
  activeTooltip = '';

  imageArtworkValue: any;
  @ViewChild('artworkFileInput') artworkFileInput: ElementRef;

  tempValue = Math.random();
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _smartartService: SmartArtService,
    private router: Router,
    private _activeRoute: ActivatedRoute,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.quoteData = this.dataForNewComponent?.quoteData;
    this.quoteImprintdata = this.dataForNewComponent?.quoteImprintdata;
    this.paramData = this.dataForNewComponent?.paramData;
    this.smartArtUser = this.dataForNewComponent?.smartArtUser;
    this.artworktemplatesData = this.dataForNewComponent?.artworktemplatesData;
    this.contactProofs = this.dataForNewComponent?.contactProofs;
    console.log(this.quoteData);
    console.log(this.quoteImprintdata);

    this.userData = JSON.parse(localStorage.getItem('userDetails'));
    this.quoteImprintdata.forEach(imprint => {
      imprint.recipientsComment = 'Please double check all details of this proof for accuracy.  (ie. phone numbers, email/addresses, websites).';
      this.generateEmailRecipinets(imprint);
      imprint.artworkDate = '';
      imprint.artworkTime = '';
      if (imprint.formattedApproveByDate) {
        let date = imprint.formattedApproveByDate.split('|||');
        imprint.artworkDate = date[0];
        imprint.artworkTime = date[1];
      }
      imprint.bgColor = this.setImprintColor(imprint.fk_statusID);
      const url = `https://assets.consolidus.com/Artwork/Proof/Quotes/${this.paramData.pfk_userID}/${this.paramData.fk_cartID}/${this.paramData.pk_cartLineID}/${imprint.imprintID}.jpg`;
      this.checkIfImageExists(url, imprint);
    });
    this._changeDetectorRef.markForCheck();
  };
  generateEmailRecipinets(imprint) {
    if (imprint.fk_artApprovalContactID || (imprint.fk_storeUserApprovalContactID && !imprint.blnStoreUserApprovalDone)) {
      if (this.quoteData.billingStudentOrgCode) {
        imprint.emailRecipients = this.quoteData.advisorEmail;
      } else {
        imprint.emailRecipients = imprint.qryApprovalContactEmail;
      }
    } else {
      imprint.emailRecipients = this.quoteData.email;
    }
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
  checkIfImageExists(url, imprint) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        imprint.viewProofCheck = true;
        return;
      };

      img.onerror = () => {
        return;
      };
    }
  };
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
  updateProofContact(imprint) {
    let artAprrovalID;
    if (imprint.selectedContact == 0) {
      artAprrovalID = 0;
    } else {
      artAprrovalID = imprint.selectedContact.pk_artApprovalContactID;
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
  mouseEnter(ev: any) {
    this.activeTooltip = ev.target.id;
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
    img.src = `${environment.assetsURL}globalAssets/Products/HiRes/${imprint.pk_storeProductID}.jpg`;
    img.onload = () => {
      imprint.thumbnailURL = `${environment.assetsURL}globalAssets/Products/HiRes/${imprint.pk_storeProductID}.jpg`;
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
      files: [`/Artwork/Proof/Quotes/${this.paramData.pfk_userID}/${this.paramData.fk_cartID}/${this.paramData.pk_cartLineID}/${imprint.imprintID}.jpg`],
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
    path = `/Artwork/Proof/Quotes/${this.paramData.pfk_userID}/${this.paramData.fk_cartID}/${this.paramData.pk_cartLineID}/${imprint.imprintID}.jpg`;
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
        this.tempValue = Math.random();
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
      approvingStoreUserID = this.quoteData.pfk_userID;
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
    if (imprint.emailRecipients.trim() == '') {
      this._smartartService.snackBar('Please enter recipient email');
      return;
    }
    const { firstName, lastName, storeUserID, fk_cartID, pk_cartLineID, email, sessionArtworkCompanyName, storePrimaryHighlight, pk_storeID, storeName, storeURL, storeCode, protocol, sessionArtworkrutgersStudentType, blnGroupRun, productName, productNumber, productID, orderQuantity } = this.quoteData;
    // let payload: UploadQuoteArtProof = {
    //   blnIncludeApproveByDate: imprint.blnIncludeApproveByDate,
    //   approveByDate: date,
    //   cartID: fk_cartID,
    //   pk_userID: this.userData.pk_userID, //main login id
    //   emailRecipients: imprint.emailRecipients, // comma separated
    //   cartLineID: pk_cartLineID, approvingStoreUserID,
    //   fk_artApprovalContactID: imprint.fk_artApprovalContactID,
    //   fk_storeUserApprovalContactID: imprint.fk_storeUserApprovalContactID,
    //   storeUserID, firstName, lastName, email,
    //   companyName: sessionArtworkCompanyName, storePrimaryHighlight,
    //   storeID: pk_storeID, storeName, storeURL, storeCode, protocol,
    //   customerRutgersEmployeeType: string;
    //   customerRutgersStudentType: sessionArtworkrutgersStudentType,
    //   blnGroupRun,
    //   productImageURL: imprint.thumbnailURL,
    //   productName: productName[0],
    //   productNumber,
    //   productID,
    //   cartLineQuantity: orderQuantity,
    //   decorationName: imprint.methodName,
    //   locationName: imprint.locationName,
    //   colorNameList: imprint.colorNameList,
    //   upload_quote_art_proof: true,

    //   imprintColors: imprint.itemColors,

    //   orderID: number;
    //   orderLineID: number;
    //   orderLineImprintID: number;
    //   imprintID: number;
    //   statusID: number;
    //   thumbnailImage: imprint.thumbnailURL,
    //   smartArtAdminEmail: string;
    //   inHandsDate: string;
    //   storeProductID: number;
    //   orderLineQuantity: number;
    //   blnIgnoreAdditionalArtEmails: boolean;
    //   blnProofSent: boolean;
    //   comment: string;
    //   blnRespond: boolean;
    //   loggedInUserID: number;
    //   groupOrderID: number;
    //   isFileExist: boolean;








    //   thumbnailImage: imprint.thumbnailURL,
    //   blnIncludeApproveByDate: imprint.blnIncludeApproveByDate,
    //   approveByDate: date,
    //   orderLineID: Number(this.paramData.pk_orderLineID),
    //   orderID: this.orderData.pk_orderID,
    //   imprintID: imprint.pk_imprintID,
    //   emailRecipients: imprint.emailRecipients,
    //   smartArtAdminEmail: this.smartArtUser.email,
    //   storeID: this.orderData.pk_storeID,
    //   storeName: this.orderData.storeName,
    //   storeURL: this.orderData.storeURL.toLowerCase(),
    //   storeCode: this.orderData.storeCode,
    //   protocol: this.orderData.protocol,
    //   productName: this.orderData.productName.replace(/'/g, "''"),
    //   productNumber: this.orderData.sessionArtwork_productNumber.replace(/'/g, "''"),
    //   storePrimaryHighlight: this.orderData.storePrimaryHighlight,
    //   inHandsDate: this.orderData.inHandsDate,
    //   blnGroupRun: this.orderData.blnGroupRun,
    //   storeProductID: this.orderData.pk_storeProductID,
    //   orderLineQuantity: this.orderData.quantity,
    //   methodName: imprint.decorationName,
    //   locationName: imprint.locationName,
    //   imprintColors: imprint.imprintColors,
    //   firstName: this.orderData?.firstName,
    //   lastName: this.orderData?.lastName,
    //   email: this.orderData.email,
    //   comment: imprint.recipientsComment.replace(/'/g, "''"),
    //   userID: Number(this.orderData.pfk_userID),
    //   approvingStoreUserID: approvingStoreUserID,
    //   companyName: this.orderData.sessionArtworkCompanyName,
    //   blnIgnoreAdditionalArtEmails: this.orderData.blnIgnoreAdditionalArtEmails,
    //   blnProofSent: imprint.blnProofSent,
    //   fk_artApprovalContactID: imprint.fk_artApprovalContactID,
    //   fk_storeUserApprovalContactID: imprint.fk_storeUserApprovalContactID,
    //   blnRespond: imprint.blnRespond,
    //   // loggedInUserID: Number(this.smartArtUser.adminUserID),
    //   loggedInUserID: Number(this.userDetails.pk_userID),
    //   groupOrderID: this.orderData.fk_groupOrderID,
    //   upload_order_art_proof: true
    // }
    // this.artworkFileInput.nativeElement.value = '';
    // this.imageArtworkValue = null;
    // let index = this.quoteImprintdata.findIndex(imp => imp.pk_imprintID == imprint.pk_imprintID)
    // this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   imprint.artworkProofLoader = false;
    //   imprint.statusName = 'Awaiting Artwork Approval';
    //   imprint.fk_statusID = 3;
    //   this.setitemColorsWithIDs(imprint);
    //   imprint.imprintComments = imprint.imprintComments + ' <br>' + res["customerComment"];
    //   this.orderData.internalComments = this.orderData.internalComments + res["orderComment"];
    //   imprint.bgColor = this.setImprintColor(imprint.pk_statusID);
    //   // console.log(imprint);
    //   this._smartartService.snackBar(res["message"]);
    //   this.updateImprintsData();
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   imprint.artworkProofLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // });
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
