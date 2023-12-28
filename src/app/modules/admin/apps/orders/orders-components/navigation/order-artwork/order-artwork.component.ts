import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import { AddArtworkComment, updateArtworkStatus } from '../../orders.types';
import moment from 'moment';
import { AuthService } from 'app/core/auth/auth.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
declare var $: any;
@Component({
  selector: 'app-order-artwork',
  templateUrl: './order-artwork.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderArtWorkComponent implements OnInit, OnDestroy {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  selectedOrder: any;

  orderParticipants = [];
  orderDetail: any;
  orderProducts = [];
  not_available = 'N/A';
  imgUrl = environment.productMedia;
  @ViewChild('drawer', { static: true }) sidenav: MatDrawer;
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
  user: any;
  randomString: any = new Date().getTime();
  removeContent: any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _orderService: OrdersService,
    private _commonService: DashboardsService,

  ) { }

  ngOnInit(): void {
    this.user = this._authService.parseJwt(this._authService.accessToken);
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["data"].length) {
        this.orderDetail = res["data"][0];
        this.getOrderProducts();
      }
    });
  }
  getOrderProducts() {
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let value = [];
      res["data"].forEach((element, index) => {
        element.products = [];
        element.imprints = [];
        this.orderProducts.push(element);
        this.getProofFiles(element.pk_orderLineID, index);
        this.getArtworkFiles(element.pk_orderLineID, index);
        value.push(element.pk_orderLineID);
        if (index == res["data"].length - 1) {
          this.getLineProducts(value.toString());
        }
      });
    })
  }
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let products = [];
      res["data"].forEach(element => {
        const index = this.orderProducts.findIndex(item => item.pk_orderLineID == element.fk_orderLineID);
        if (this.orderProducts[index].products.length > 0) {
          this.orderProducts[index].products.push(element);
        } else {
          this.orderProducts[index].products = [element];
        }
      });
      this.getProductImprints(value);
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductImprints(value) {
    let params = {
      imprint_report: true,
      order_line_id: value
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let tempArr = [];
      let imprintIds = [];
      res["data"].forEach(element => {
        const index = this.orderProducts.findIndex(item => item.pk_orderLineID == element.fk_orderLineID);
        element.artworkFiles = [];
        element.artworkProofs = [];
        element.delLoader = false;
        imprintIds.push(element.pk_imprintID);
        // this.checkIfImageExists(element, `https://assets.consolidus.com/artwork/Proof/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${element.fk_orderLineID}/${element.pk_imprintID}.jpg`);
        if (this.orderProducts[index]?.artworkFiles) {
          if (this.orderProducts[index].artworkFiles.length > 0) {
            this.orderProducts[index].artworkFiles.forEach(file => {
              if (file.ID.includes(element.pk_imprintID)) {
                element.artworkFiles.push(file);
              }
            });
          }
        }
        if (this.orderProducts[index]?.artworkProofs) {
          if (this.orderProducts[index].artworkProofs.length > 0) {
            this.orderProducts[index].artworkProofs.forEach(file => {
              if (file.ID.includes(element.pk_imprintID)) {
                element.artworkProofs.push(file);
              }
            });
          }
        }
        this.orderProducts[index].imprints.push(element);
      });
      this.getImprintsStatus(imprintIds.toString(), value.toString());
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getImprintsStatus(value, orders) {
    let params = {
      imprint_status: true,
      order_line_id: orders,
      imprint_id: value
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      res["data"].forEach(element => {
        this.orderProducts.forEach(item => {
          const index = item.imprints.findIndex(imprint => element.fk_imprintID == imprint.pk_imprintID);
          if (index >= 0) {
            item.imprints[index].status = element;
          }
        });
      });
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProofFiles(pk_orderLineID, index) {
    let payload = {
      files_fetch: true,
      path: `/artwork/Proof/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${pk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._orderService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.orderProducts[index].artworkProofs = files["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  getArtworkFiles(pk_orderLineID, index) {
    let payload = {
      files_fetch: true,
      path: `/artwork/${this.orderDetail.fk_storeID}/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${pk_orderLineID}/`
    }
    let i = 1;
    this._changeDetectorRef.markForCheck();
    this._orderService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      this.orderProducts[index].artworkFiles = files["data"];
      this.orderProducts?.forEach(data => {
        data?.artworkFiles?.forEach(item => {
          item.counter = i;
          i++;
        })
      })
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  checkIfImageExists(imprint, url) {
    const img = new Image();
    img.src = url;

    if (img.complete) {

    } else {
      img.onload = () => {
        imprint.proofImg = true;
        this._changeDetectorRef.markForCheck();
        // return true;
      };

      img.onerror = () => {
        imprint.proofImg = false;
        this._changeDetectorRef.markForCheck();
        return;
      };
    }
  };
  openSideNav(item) {
    this.sideNavData = item;
    this.sidenav.toggle();
  }
  closeSideNav() {
    this.sideNavData = null;
    this.sidenav.toggle();
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
    let count = imprint.artworkFiles.length + 1;
    if (!this.imageValue) {
      this._orderService.snackBar('Please select a file');
      return;
    }
    const { imageUpload, name, type } = this.imageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/artwork/${this.orderDetail.fk_storeID}/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${imprint.fk_orderLineID}/${count}-${imprint.pk_imprintID}.${type}`
    };
    imprint.uploadLoader = true;
    this._orderService.getFiles(payload)
      .subscribe((response) => {
        // Mark for check
        this.getArworkFilesNew(imprint);
        this.imageValue = undefined;
        this.fileInput.nativeElement.value = '';
        this._changeDetectorRef.markForCheck();
      }, err => {
        imprint.uploadLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  getArworkFilesNew(imprint) {
    let payload = {
      files_fetch: true,
      path: `/artwork/${this.orderDetail.fk_storeID}/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${imprint.fk_orderLineID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._orderService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      imprint.artworkFiles = [];
      files["data"].forEach(file => {
        if (file.ID.includes(imprint.pk_imprintID)) {
          imprint.artworkFiles.push(file);
        }
      });
      this._orderService.snackBar('Artwork File Updated Successfully.')
      imprint.uploadLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
  openCommentModal(data) {
    this.artworkComment = '';
    this.modalContent = data;
    $(this.commentModal.nativeElement).modal('show');
  }

  replaceSingleQuotesWithDoubleSingleQuotes(obj: { [key: string]: any }): any {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'string') {
        obj[key] = obj[key]?.replace(/'/g, "''");
      }
    }
    return obj;
  }

  addNewComment() {
    if (this.artworkComment.trim() === '') {
      this._orderService.snackBar('Please add any comment');
      return
    }
    this.modalContent.commentLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload: AddArtworkComment = {
      orderID: this.orderDetail.pk_orderID,
      orderLineID: this.modalContent.fk_orderLineID,
      imprintID: this.modalContent.pk_imprintID,
      productName: this.modalContent.productName,
      locationName: this.modalContent.locationName,
      methodName: this.modalContent.methodName,
      storeName: this.orderDetail.storeName,
      userFirstName: this.orderDetail.userFirstName,
      userLastName: this.orderDetail.userLastName,
      userEmail: this.orderDetail.userEmail,
      comment: this.artworkComment,
      add_artwork_comment: true
    }
    this._orderService.orderPostCalls(this.replaceSingleQuotesWithDoubleSingleQuotes(payload)).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._orderService.snackBar(res["message"]);
      }
      this.modalContent.commentLoader = false;
      this.modalContent.customerArtworkComment = `${this.modalContent.customerArtworkComment}<br /><br /> - ${this.user.name} Added A Comment (${moment().format('MM/DD/YY')} @ ${moment().format('LT')}) - <br /><br /> ${this.artworkComment}`;
      this.artworkComment = '';
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.modalContent.commentLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  openRemoveModal(orderIndex, imprintIndex, artworkIndex, name) {
    this.removeFileName = name;
    this.removeModalOrderIndex = orderIndex;
    this.artworkIndex = artworkIndex;
    this.removeModalIndex = imprintIndex;
    $(this.removeArtwork.nativeElement).modal('show');
  }

  removeImage() {
    $(this.removeArtwork.nativeElement).modal('hide');
    this.orderProducts[this.removeModalOrderIndex].imprints[this.removeModalIndex].artworkFiles[this.artworkIndex].delLoader = true;
    this._changeDetectorRef.markForCheck();
    let payload = {
      files: [`/artwork/${this.orderDetail.fk_storeID}/${this.orderDetail.fk_storeUserID}/${this.orderDetail.pk_orderID}/${this.orderProducts[this.removeModalOrderIndex].imprints[this.removeModalIndex].fk_orderLineID}/${this.removeFileName}`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload)
      .subscribe((response) => {
        this._orderService.snackBar('Artwork File Removed Successfully');
        this.orderProducts[this.removeModalOrderIndex].imprints[this.removeModalIndex].artworkFiles.splice(this.artworkIndex, 1);
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.orderProducts[this.removeModalOrderIndex].imprints[this.removeModalIndex].artworkFiles[this.artworkIndex].delLoader = true;
        this._changeDetectorRef.markForCheck();
      })
  }
  updateMarkRevisionNeeded(data) {
    data.revisionLoader = true;
    let payload: updateArtworkStatus = {
      orderLineID: data.fk_orderLineID,
      imprintID: data.pk_imprintID,
      blnRespond: data.status.blnRespond,
      update_artwork_status: true
    }
    this._orderService.updateOrderCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._orderService.snackBar(res["message"]);
        data.status.statusName = 'Artwork Revision';
      }
      data.revisionLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      data.revisionLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
