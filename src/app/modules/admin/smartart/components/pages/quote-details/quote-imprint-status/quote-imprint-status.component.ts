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
import { AddSmartArtCartComment, sendAutoRequest, UpdateArtworkTgas, updateImprintColors, UpdateQuoteArtworkStatus, updateQuoteAttentionFlag, UpdateQuoteClaim, updateQuoteImprintTime, UpdateQuoteOptions, updateQuoteProofContact, updateQuotePurchaseOrderComment, updateReorderNumber, UploadQuoteArtProof } from '../../../smartart.types';
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
      imprint.statusID = 9;
      const url = `https://assets.consolidus.com/Artwork/Proof/Quotes/${this.paramData.pfk_userID}/${this.paramData.fk_cartID}/${this.paramData.pk_cartLineID}/${imprint.imprintID}.jpg?${this.tempValue}`;
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
        this._changeDetectorRef.markForCheck();
        return;
      };

      img.onerror = () => {
        imprint.viewProofCheck = false;
        this._changeDetectorRef.markForCheck();
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
        imprint.viewProofCheck = true;
        this.tempValue = Math.random();
        this._changeDetectorRef.markForCheck();
      }, err => {
        imprint.artworkProofLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  uploadArtworkProof(imprint) {
    const url = `https://assets.consolidus.com/globalAssets/Stores/quoteExports/${this.quoteData.storeName}/${this.quoteData.fk_cartID}.pdf`;
    let params = {
      file_check: true,
      url: url
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(fileRes => {
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
      const { firstName, lastName, storeUserID, fk_cartID, pk_cartLineID, email, sessionArtworkCompanyName, storePrimaryHighlight, pk_storeID, storeName, storeURL, storeCode, protocol, sessionArtworkrutgersStudentType, blnGroupRun, productName, productNumber, productID, orderQuantity, blnIgnoreAdditionalArtEmails, sessionArtworkrutgersEmployeeType } = this.quoteData;

      const { blnIncludeApproveByDate, emailRecipients, fk_artApprovalContactID, fk_storeUserApprovalContactID, thumbnailURL, methodName, locationName, colorNameList, itemColors, proofComments, imprintID, fk_statusID, blnRespond } = imprint;
      let payload: UploadQuoteArtProof = {
        blnIncludeApproveByDate,
        approveByDate: date,
        cartID: fk_cartID,
        pk_userID: this.userData.pk_userID,
        emailRecipients: emailRecipients, // comma separated
        cartLineID: pk_cartLineID,
        approvingStoreUserID,
        fk_artApprovalContactID,
        fk_storeUserApprovalContactID,
        storeUserID,
        firstName,
        lastName,
        email,
        companyName: sessionArtworkCompanyName,
        storePrimaryHighlight,
        storeID: pk_storeID,
        storeName,
        storeURL,
        storeCode,
        protocol,
        customerRutgersEmployeeType: sessionArtworkrutgersEmployeeType,
        customerRutgersStudentType: sessionArtworkrutgersStudentType,
        blnGroupRun,
        productImageURL: thumbnailURL,
        productName: productName[0],
        productNumber,
        productID,
        cartLineQuantity: orderQuantity,
        decorationName: methodName,
        locationName,
        colorNameList,
        proofComment: proofComments,
        imprintColors: itemColors,
        imprintID,
        statusID: fk_statusID,
        thumbnailImage: thumbnailURL,
        smartArtAdminEmail: this.smartArtUser.email,
        inHandsDate: this.quoteData.inHandsDateValue,
        blnIgnoreAdditionalArtEmails,
        blnRespond,
        isFileExist: fileRes["isFileExist"],
        upload_quote_art_proof: true
      }
      payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
      this.artworkFileInput.nativeElement.value = '';
      this.imageArtworkValue = null;
      this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        imprint.artworkProofLoader = false;
        imprint.statusName = 'Awaiting Artwork Approval';
        imprint.fk_statusID = 3;
        imprint.bgColor = this.setImprintColor(imprint.fk_statusID);
        imprint.customerComments = imprint.customerComments + ' <br>' + res["customerComment"];
        this._smartartService.snackBar(res["message"]);
        this._changeDetectorRef.markForCheck();
      }, err => {
        imprint.artworkProofLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    });
  }
  // update Statuses
  updateStatuses(imprint, statusID, type?) {
    if (type == 'apply') {
      imprint.applyStatusLoader = true;
    } else {
      this.statusLoader(imprint, statusID, true);
    }
    const fileUrl = `https://assets.consolidus.com/globalAssets/Stores/quoteExports/${this.quoteData.storeName}/${this.quoteData.fk_cartID}.pdf`;
    let params = {
      file_check: true,
      url: fileUrl
    }
    this._smartartService.getSmartArtData(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(fileRes => {
      imprint.isFileExist = fileRes["isFileExist"];
      const url = `${environment.assetsURL}globalAssets/Products/HiRes/${imprint.pk_storeProductID}.jpg`;
      this._commonService.checkImageExistData(url).then(image => {
        imprint.thumbnailURL = image ? url : `https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg`;
        this.applyStatusChange(imprint, statusID);
      });
    });
  }
  applyStatusChange(imprint, statusID) {
    const { firstName, lastName, storeUserID, fk_cartID, pk_cartLineID, email, sessionArtworkCompanyName, storePrimaryHighlight, pk_storeID, storeName, storeURL, storeCode, protocol, sessionArtworkrutgersStudentType, blnGroupRun, productName, productNumber, productID, orderQuantity, blnIgnoreAdditionalArtEmails, sessionArtworkrutgersEmployeeType, quoteDate, inHandsDateValue, pfk_userID, blnAdditionalArtApproval, blnAdditionalApprovalOverride, sessionArtworkBillingStudentOrgCode } = this.quoteData;

    const { blnIncludeApproveByDate, emailRecipients, fk_artApprovalContactID, fk_storeUserApprovalContactID, thumbnailURL, methodName, locationName, colorNameList, itemColors, isFileExist, proofComments, imprintID, fk_statusID, blnRespond, blnProofSent, approveByDate } = imprint;

    const { adminUserID } = this.smartArtUser;

    let blnApproved = false;
    const allowedStatusIDs = [5, 6, 7, 9, 11, 16];
    if (allowedStatusIDs.includes(statusID)) {
      blnApproved = true;
    }
    let converDate;
    if (inHandsDateValue) {
      converDate = moment(inHandsDateValue).format('MM/DD/yyyy')
    }
    let approveDate;
    if (approveByDate) {
      approveDate = moment(approveByDate).format('MM/DD/yyyy')
    }
    let approvingStoreUserID = null;
    if (fk_storeUserApprovalContactID) {
      approvingStoreUserID = fk_storeUserApprovalContactID;
    } else if (fk_artApprovalContactID) {
      approvingStoreUserID = fk_artApprovalContactID;
    } else {
      approvingStoreUserID = storeUserID;
    }
    let payload: UpdateQuoteArtworkStatus = {
      cartLineID: pk_cartLineID,
      cartID: fk_cartID,
      cartDate: quoteDate,
      imprintID,
      userID: pfk_userID,
      inHandsDate: converDate,
      statusID,
      storeID: pk_storeID,
      storeName,
      storeCode,
      protocol,
      storeURL,
      blnRespond,
      blnGroupRun,
      proofComments,
      blnApproved, // Check fk_statusID for all orderLineImprintID's in the orderline 1 if statusID of imprint is "5,6,7,9,11,16" else 0
      smartArtLoggedInUserName: this.smartArtUser.firstName + ' ' + this.smartArtUser.lastName,
      blnAdditionalArtApproval,
      blnAdditionalApprovalOverride,
      storePrimaryHighlight,
      billingStudentOrgCode: sessionArtworkBillingStudentOrgCode,
      imprintsCount: this.quoteImprintdata.length,
      storeProductImage: thumbnailURL,
      blnIgnoreAdditionalArtEmails,
      blnProofSent,
      fk_artApprovalContactID: approvingStoreUserID,
      fk_storeUserApprovalContactID,
      storeUserID,
      isFileExist,
      proofComment: proofComments,
      pk_userID: this.userData.pk_userID,
      productNumber,
      productName: productName[0],
      locationName,
      methodName,
      userCompanyName: sessionArtworkCompanyName,
      firstName,
      lastName,
      email,
      productID,
      orderQuantity,
      colorNameList,
      blnIncludeApproveByDate,
      approveByDate: approveDate,
      update_quote_artwork_status: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.statusLoader(imprint, statusID, false);
      if (res) {
        this._smartartService.snackBar(res["message"]);
        if (statusID == 9) {
          this.statusNameAndDate(imprint, res["returnedStatus"]);
          if (imprint.viewProofCheck) {
            this.removeProofArtImage(imprint);
          }
        } else {
          this.statusNameAndDate(imprint, statusID);
        }
        imprint.applyStatusLoader = false;
        this.updateImprintData(imprint);
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      imprint.applyStatusLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  statusLoader(imprint, statusID, loader) {
    const statusMappings = {
      2: { loader: 'pendingStatusLoader', comment: 'Please double check all details of this proof for accuracy. (ie. phone numbers, email/addresses, websites).' },
      3: { loader: 'awaitingStatusLoader' },
      4: { loader: 'artworkStatusLoader', comment: 'Please double check all details of this proof for accuracy. (ie. phone numbers, email/addresses, websites).' },
      7: { loader: 'proofStatusLoader' },
      9: { loader: 'approveStatusLoader' },
      12: { loader: 'holdStatusLoader' },
      13: { loader: 'followStatusLoader' }
    };

    const statusMapping = statusMappings[statusID];

    if (statusMapping) {
      imprint[statusMapping.loader] = loader;
      imprint.recipientsComment = statusMapping.comment || imprint.recipientsComment;
    }
    this._changeDetectorRef.markForCheck();
  }
  statusNameAndDate(imprint, statusID) {
    const statusNameMappings = {
      2: 'NEW PENDING',
      3: 'AWAITING ARTWORK APPROVAL',
      4: 'ARTWORK REVISION',
      7: 'NO PROOF NEEDED',
      9: 'ARTWORK APPROVED',
      12: 'ON HOLD',
      13: 'FOLLOW UP FOR APPROVAL'
    };

    const statusName = statusNameMappings[statusID];

    if (statusName) {
      imprint.statusName = statusName;
      imprint.fk_statusID = statusID;
      imprint.statusDate = moment().format('yyyy-MM-DD');
    }

    imprint.bgColor = this.setImprintColor(statusID);
    this._changeDetectorRef.markForCheck();
  }
  updateImprintData(imprint) {
    imprint.proofComments = '';
    imprint.statusID = 9;
    imprint.emailRecipients = '';
    imprint.recipientsComment = '';
    this.generateEmailRecipinets(imprint);
    this._changeDetectorRef.markForCheck();
  }

  sendFollwUpEmail(imprint) {
    // imprint.followUPLoader = true;
    // const url = `https://assets.consolidus.com/globalAssets/Products/HiRes/${this.orderData.pk_storeProductID}.jpg?${this.randomString}`;
    // let storeImage: any = '';
    // this.checkImageExist(url).then(imgRes => {
    //   if (imgRes) {
    //     storeImage = url;
    //   } else {
    //     storeImage = 'https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg';
    //   }
    //   let payload: sendOrderCustomerFollowUpEmail = {
    //     orderID: Number(this.paramData.fk_orderID),
    //     orderLineID: Number(this.paramData.pk_orderLineID),
    //     orderLineImprintID: Number(imprint.pk_imprintID),
    //     artApprovalContactID: this.orderData.fk_artApprovalContactID,
    //     storeUserApprovalContactID: this.orderData.fk_storeUserApprovalContactID,
    //     protocol: this.orderData.protocol,
    //     email_recipients: imprint.emailRecipients.split(','),
    //     smartArtAdminEmail: this.smartArtUser.email,
    //     locationName: imprint.locationName,
    //     methodName: imprint.decorationName,
    //     imprintColors: imprint.imprintColors,
    //     productNumber: this.orderData.sessionArtwork_productNumber,
    //     productName: this.orderData.sessionArtwork_productName,
    //     primaryHighlight: this.orderData.storePrimaryHighlight,
    //     storeID: this.orderData.sessionArtworkStoreID,
    //     storeName: this.orderData.sessionArtworkStoreName,
    //     storeCode: this.orderData.storeCode,
    //     storeProductID: this.orderData.pk_storeProductID,
    //     quantity: this.orderData.quantity,
    //     storeProductImageURL: storeImage,
    //     storeUserFirstName: this.orderData.sessionArtworkFirstName,
    //     storeUserLastName: this.orderData.sessionArtworkLastName,
    //     storeUserEmail: this.orderData.sessionArtworkEmail,
    //     storeUserID: this.orderData.fk_storeUserID,
    //     storeUserCompanyName: this.orderData.sessionArtworkCompanyName,
    //     blnStoreUserApprovalDone: imprint.blnStoreUserApprovalDone,
    //     send_order_customer_followUp_email: true
    //   }
    //   this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
    //     imprint.followUPLoader = false;
    //     this._changeDetectorRef.markForCheck();
    //   })).subscribe(res => {
    //     if (res["success"]) {
    //       imprint.statusName = 'AWAITING ARTWORK APPROVAL';
    //       imprint.pk_statusID = 3;
    //       this.setImprintColor(imprint);
    //       this.updateImprintsData();
    //       this._smartartService.snackBar('Artwork status successfully updated.');
    //       this._changeDetectorRef.markForCheck();
    //     }
    //   });
    // });
  }
  sendOrderProofUpdates(imprint) {
    // let payload: sendOrderProofUpdate = {
    //   imprintLocationName: imprint.locationName,
    //   imprintMethodName: imprint.decorationName,
    //   imprintID: Number(imprint.pk_imprintID),
    //   storeName: this.orderData.storeName,
    //   orderID: this.orderData.pk_orderID,
    //   storeID: this.orderData.sessionArtworkStoreID,
    //   productName: this.orderData.sessionArtwork_productName,
    //   storeUserID: this.orderData.fk_storeUserID,
    //   orderLineID: Number(this.paramData.pk_orderLineID),
    //   send_order_proof_update: true
    // }
    // imprint.senOrderProofLoader = true;
    // this._smartartService.AddSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
    //   imprint.senOrderProofLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // }, err => {
    //   imprint.senOrderProofLoader = false;
    //   this._changeDetectorRef.markForCheck();
    // });
  }
  // Update order Attention
  updateAttentionFlagOrder(imprint, check) {
    imprint.isFlagLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: updateQuoteAttentionFlag = {
      bln_attention: check,
      cartLine_id: Number(this.quoteData.pk_cartLineID),
      imprint_id: Number(imprint.imprintID),
      update_quote_attention_flag: true
    }
    this._smartartService.UpdateSmartArtData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._smartartService.snackBar(res["message"]);
      imprint.isFlagLoader = false;
      imprint.blnAttention = check;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.isFlagLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
