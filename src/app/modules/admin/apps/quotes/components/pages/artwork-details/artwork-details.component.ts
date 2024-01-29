import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { QuotesService } from '../../quotes.service';
import { environment } from 'environments/environment';
import { takeUntil } from 'rxjs/operators';
import { AddCartArtworkComment, updateCartArtworkStatus } from '../../quotes.types';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
declare var $: any;
@Component({
  selector: 'app-artwork-details',
  templateUrl: './artwork-details.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class QuoteArtworkDetailsComponent implements OnInit, OnDestroy {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  selectedOrder: any;

  orderParticipants = [];
  quoteDetail: any;
  orderProducts = [];
  not_available = 'N/A';
  imgUrl = environment.productMedia;
  sideNavData: any;
  tempDate = Math.random();
  modalContent: any;
  artworkComment: string = '';
  @ViewChild('commentModal') commentModal: ElementRef;
  @ViewChild('fileInput') fileInput: ElementRef;
  imageValue: any;
  @ViewChild('removeArtwork') removeArtwork: ElementRef;
  removeModalIndex: any;
  removeModalOrderIndex: any;
  removeFileName: string = '';
  artworkIndex: any;

  artworkData: any = [];
  removeContent: any;
  user: any
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    public _quoteService: QuotesService,
    private _commonService: DashboardsService,
    private _authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    this._quoteService.qoutesDetails$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.quoteDetail = res["data"][0];
      if (this.quoteDetail.programManagerDetails) {
        let program_manager = this.quoteDetail.programManagerDetails.split('||');
        this.quoteDetail.ManagerName = program_manager[0];
        this.quoteDetail.ManagerEmail = program_manager[1];
        this.quoteDetail.ManagerID = program_manager[2];
      }
      if (this.quoteDetail.artworkStatus.includes('7') || this.quoteDetail.artworkStatus.includes('9')) {
        this.quoteDetail.mainStatus = true;
        this.quoteDetail.statusName = 'All artwork approved';
        this.quoteDetail.statusColor = 'text-green-600';
      } else {
        this.quoteDetail.mainStatus = false;
        this.quoteDetail.statusName = 'Artwork pending';
        this.quoteDetail.statusColor = 'text-red-600';
      }
      this.getArtworkDetails();
    })
  }
  getArtworkDetails() {
    let paramas = {
      cart_artwork_details: true,
      cart_id: this.quoteDetail.pk_cartID
    }
    this._quoteService.getQuoteData(paramas).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        element.imprints = [];
        if (element.imprintDetails) {
          let imprints = element.imprintDetails.split('#_');
          imprints.forEach((imprint, index) => {
            let splitImprint = imprint.split('||');
            let find = element.imprints.find(elem => elem.id == splitImprint[0]);
            if (!find) {
              element.imprints.push({ artworkFiles: [], productName: element.productName, pk_cartLineID: element.pk_cartLineID, id: Number(splitImprint[0]), locationName: splitImprint[5], methodName: splitImprint[6], comments: splitImprint[7], customerLogoBankID: splitImprint[3], locationLogoBankID: splitImprint[4], logoBankID: splitImprint[8], statusName: splitImprint[9], blnRespond: splitImprint[10] });
              this.checkIfImageExists(element.imprints[index], `https://assets.consolidus.com/artwork/Proof/Quotes/${this.quoteDetail.storeUserID}/${this.quoteDetail.pk_cartID}/${element.pk_cartLineID}/${splitImprint[0]}.jpg`);
            }
            if (imprints.length == index + 1) {
              // if (splitImprint[3] == 0 && splitImprint[4] == 0 && splitImprint[8] == 0) {
              this.getArworkFilesNew(element);
            }
            // }
          });
        }
      });
      this.artworkData = res["data"];
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  checkIfImageExists(imprint, url) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        if (imprint) {
          imprint.proofImg = true;
        }
        this._changeDetectorRef.markForCheck();
        // return true;
      };

      img.onerror = () => {
        if (imprint) {
          imprint.proofImg = false;
        }
        this._changeDetectorRef.markForCheck();
        return;
      };
    }
  };
  getArworkFilesNew(data) {
    let payload = {
      files_fetch: true,
      path: `/artwork/quotes/${this.quoteDetail.storeID}/${this.quoteDetail.storeUserID}/${this.quoteDetail.pk_cartID}/${data.pk_cartLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._quoteService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      let count = 0;
      data.imprints.forEach(element => {
        element.artworkFiles = [];
        files["data"].forEach((file, index) => {
          file.count = index + 1;
          if (file.ID.includes(element.id)) {
            file.delLoader = false;
            element.artworkFiles.push(file);
          }
        });
      });
      data.imprints.forEach(element => {
        element.artworkFiles.forEach(file => {
          count = count + 1;
          file.count = count;
        });
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
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
      const extension = type.split("/")[1]; // Extract the extension from the MIME type
      this.imageValue = {
        imageUpload: reader.result,
        type: extension
      };
    }
  };
  uploadArtworkMedia(imprint) {
    if (!this.imageValue) {
      this._quoteService.snackBar('Please choose any file');
      return;
    }
    imprint.uploadLoader = true;
    let count = imprint.artworkFiles.length + 1;
    const { imageUpload, name, type } = this.imageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/artwork/quotes/${this.quoteDetail.storeID}/${this.quoteDetail.storeUserID}/${this.quoteDetail.pk_cartID}/${imprint.pk_cartLineID}/${count}-${imprint.id}.${type}`
    };
    this._quoteService.getFiles(payload)
      .subscribe((response) => {
        // Mark for check
        // this.getArworkFilesUpload(imprint);
        this.getArtworkDetails()
        this.fileInput.nativeElement.value = '';
        this.imageValue = null;
        this._changeDetectorRef.markForCheck();
      }, err => {
        imprint.uploadLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  getArworkFilesUpload(imprint) {
    let payload = {
      files_fetch: true,
      path: `/artwork/quotes/${this.quoteDetail.storeID}/${this.quoteDetail.storeUserID}/${this.quoteDetail.pk_cartID}/${imprint.pk_cartLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._quoteService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      imprint.artworkFiles = [];
      files["data"].forEach((file, index) => {
        if (file.ID.includes(imprint.id)) {
          imprint.artworkFiles.push(file);
        }
      });
      this._quoteService.snackBar('ArtworkFile Updated Successfully.')
      imprint.uploadLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  openRemoveModal(name, artworkIndex, imprint) {
    this.removeContent = imprint;
    this.removeFileName = name;
    this.artworkIndex = artworkIndex;
    $(this.removeArtwork.nativeElement).modal('show');
  }
  removeImage() {
    $(this.removeArtwork.nativeElement).modal('hide');
    this.removeContent.artworkFiles[this.artworkIndex].delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload = {
      files: [`/artwork/quotes/${this.quoteDetail.storeID}/${this.quoteDetail.storeUserID}/${this.quoteDetail.pk_cartID}/${this.removeContent.pk_cartLineID}/${this.removeFileName}`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload)
      .subscribe((response) => {
        this._quoteService.snackBar('Artwork File Removed Successfully');
        this.removeContent.artworkFiles[this.artworkIndex].delLoader = false;
        this.removeContent.artworkFiles.splice(this.artworkIndex, 1);
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.removeContent.artworkFiles[this.artworkIndex].delLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  openCommentModal(data) {
    this.modalContent = data;
    this.artworkComment = '';
    this.modalContent.comments = this.unescapeHtml(data.comments);
    $(this.commentModal.nativeElement).modal('show');

  }
  addNewComment() {
    if (!this.artworkComment.trim()) {
      this._quoteService.snackBar('Please add any comment');
      return
    }
    this.modalContent.commentLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: AddCartArtworkComment = {
      cartID: this.quoteDetail.pk_cartID,
      cartLineID: this.modalContent.pk_cartLineID,
      imprintID: this.modalContent.id,
      productName: this.modalContent.productName,
      locationName: this.modalContent.locationName,
      methodName: this.modalContent.methodName,
      storeName: this.quoteDetail.storeName,
      userName: this.quoteDetail.ManagerName,
      userEmail: this.quoteDetail.ManagerEmail,
      comment: this.artworkComment,
      add_cartLine_artwork_comment: true
    }
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this._quoteService.AddQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe((res: any) => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
      }
      this.modalContent.commentLoader = false;
      this.modalContent.comments = `${this.modalContent.comments}<br /><br /> - ${this.user.name} Added A Comment (${res.currentDate}) - <br /><br /> ${this.artworkComment}`;
      this.artworkComment = '';
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.modalContent.commentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  updateMarkRevisionNeeded(imprint) {
    imprint.revisionLoader = true;
    let respond = true;
    if (imprint.blnRespond == 0) {
      respond = false;
    }
    let payload: updateCartArtworkStatus = {
      cartLineID: imprint.pk_cartLineID,
      imprintID: imprint.id,
      blnRespond: respond,
      update_cartLine_artwork_status: true
    }
    this._quoteService.UpdateQuoteData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._quoteService.snackBar(res["message"]);
        imprint.statusName = 'Artwork Revision';
        this.quoteDetail.artworkStatus = 4;
        this.quoteDetail.mainStatus = false;
      }
      imprint.revisionLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      imprint.revisionLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  unescapeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
