import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardsService } from '../../../dashboard.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject, pipe } from 'rxjs';
import moment from 'moment';
import { environment } from 'environments/environment';
import * as CryptoJS from 'crypto-js';

declare var $: any;
@Component({
  selector: 'app-order-status-report',
  templateUrl: './order-status.component.html',
  styleUrls: ['./order-status.component.scss']
})
export class OrderStatusComponent implements OnInit {
  @ViewChild('rescheduleModal') rescheduleModal: ElementRef;
  @ViewChild('orderDetailsModal') orderDetailsModal: ElementRef;
  @ViewChild('orderEmailModal') orderEmailModal: ElementRef;

  @Input() userData: any;
  @Input() storesData: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  totalApporvalOrders = 0;
  approvalPage = 1;
  isApprovalLoader: boolean = false;

  approvalOrders: any;
  awaitingOrders: any;
  processingOrders: any;

  tempApprovalOrders: any;
  tempAwaitingOrders: any;
  tempProcessingOrders: any;

  approvalOrdersLoader: any;
  awaitingOrdersLoader: any;
  processingOrdersLoader: any;

  approvalOrdersStores: any;
  awaitingOrdersStores: any;
  processingOrdersStores: any;

  ngAapprovalStores: any = 'All';
  ngAwaitingStores: any = 'All';
  ngProcessingStores: any = 'All';

  rescheduleModalContent: any;
  orderDetailsModalContent: any;
  mediaURL = environment.assetsURL;

  editorConfig = {
    toolbar: [
      { name: 'clipboard', items: ['Undo', 'Redo'] },
      { name: 'styles', items: ['Format'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
      { name: 'align', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'insert', items: ['Table'] },
      { name: 'tools', items: ['Maximize'] },
    ],
    // extraPlugins: 'uploadimage,image2',
    // uploadUrl:
    //   'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
    // filebrowserUploadMethod: 'base64',
    // // Configure your file manager integration. This example uses CKFinder 3 for PHP.
    // filebrowserBrowseUrl:
    //   'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html',
    // filebrowserImageBrowseUrl:
    //   'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html?type=Images',
    // filebrowserUploadUrl:
    //   'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files',
    // filebrowserImageUploadUrl:
    //   'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Images'
    // other options
  };
  emailModalContent: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _dashboardService: DashboardsService,
  ) { }

  ngOnInit(): void {
    this.isApprovalLoader = true;
    this.getOrdersStatus();
  }

  getOrdersStatus() {
    this.approvalOrders = [];
    this.awaitingOrders = [];
    this.processingOrders = [];

    this.tempApprovalOrders = [];
    this.tempAwaitingOrders = [];
    this.tempProcessingOrders = [];

    this.approvalOrdersStores = [];
    this.awaitingOrdersStores = [];
    this.processingOrdersStores = [];

    let params = {
      order_status_reports: true,
      email: this.userData.email,
    }
    this._dashboardService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isApprovalLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      let awaitingOrders = res["data"][0][0].awaitingArtwork;
      let processingOrderss = res["data"][2][0].stillProcessingOrders;
      let awaitingOrderss = res["data"][1][0].awaitingPayment;
      // Approval Orders
      if (awaitingOrders) {
        const artworks = awaitingOrders.split(',,');
        artworks.forEach(artwork => {
          const [orderID, orderDate, blnReorder, inHandsDate, groupOrderID, storeCode, storeName, storeUserID, storeID, statusDate, statusID, reschedule, firstName, lastName, locationName, companyName, total, artworkNotification, days, priority] = artwork.split('::');
          let priorityChecked = false;
          if (Number(priority) > 0) {
            priorityChecked = true;
          }
          const existingStoreIndex = this.approvalOrdersStores.findIndex(store => store.store === storeName);
          if (existingStoreIndex > -1) {
            this.approvalOrdersStores[existingStoreIndex].data.push({ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority, priorityChecked });
          } else {
            this.approvalOrdersStores.push({ store: storeName, data: [{ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority, priorityChecked }] });
          }
          this.approvalOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), statusDate, statusID: Number(statusID), reschedule, firstName, lastName, locationName, companyName, total: Number(total), artworkNotification, days, priority, priorityChecked
          });
        });
      }
      // Awaiting Orders 
      if (awaitingOrderss) {
        const awaitOrders = awaitingOrderss.split(',,');
        awaitOrders.forEach(order => {
          const [orderID, orderDate, inHandsDate, blnReorder, groupOrderID, storeCode, storeName, storeUserID, storeID, firstName, lastName, locationName, companyName, total, paymentNotification, status, days, priority] = order.split('::');
          let statusResult = this._dashboardService.getStatusValue(status);
          let priorityChecked = false;
          if (Number(priority) > 0) {
            priorityChecked = true;
          }
          const existingStoreIndex = this.awaitingOrdersStores.findIndex(store => store.store === storeName);
          if (existingStoreIndex > -1) {
            this.awaitingOrdersStores[existingStoreIndex].data.push({ orderID: Number(orderID), orderDate, inHandsDate, blnReorder: Number(blnReorder), groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), paymentNotification, status: statusResult, days, priority, priorityChecked });
          } else {
            this.awaitingOrdersStores.push({ store: storeName, data: [{ orderID: Number(orderID), orderDate, inHandsDate, blnReorder: Number(blnReorder), groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), paymentNotification, status: statusResult, days, priority, priorityChecked }] });
          }
          this.awaitingOrders.push({
            orderID: Number(orderID), orderDate, inHandsDate, blnReorder: Number(blnReorder), groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), paymentNotification, status: statusResult, days, priority, priorityChecked
          })
        });
      }
      // Processing Orders
      if (processingOrderss) {
        const Orders = processingOrderss.split(',,');
        Orders.forEach(order => {
          const [orderID, orderDate, paymentDate, inHandsDate, blnReorder, groupOrderID, storeCode, storeName, storeUserID, storeID, firstName, lastName, locationName, companyName, total, status, priority] = order.split('::');
          let statusResult = this._dashboardService.getStatusValue(status);
          let priorityChecked = false;
          if (Number(priority) > 0) {
            priorityChecked = true;
          }
          const existingStoreIndex = this.processingOrdersStores.findIndex(store => store.store === storeName);
          if (existingStoreIndex > -1) {
            this.processingOrdersStores[existingStoreIndex].data.push({ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority, priorityChecked });
          } else {
            this.processingOrdersStores.push({ store: storeName, data: [{ orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority, priorityChecked }] });
          }
          this.processingOrders.push({
            orderID: Number(orderID), orderDate, blnReorder: Number(blnReorder), inHandsDate, paymentDate, groupOrderID: groupOrderID, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, total: Number(total), status: statusResult, priority, priorityChecked
          })
        });
      }
      this.tempApprovalOrders = this.approvalOrders;
      this.tempProcessingOrders = this.processingOrders;
      this.tempAwaitingOrders = this.awaitingOrders;

      console.log(this.awaitingOrders)
      this._changeDetectorRef.markForCheck();
    })
  }
  openOrderComments(item) {
    const url = `/apps/orders/${item.storeUserID}/comments`;
    window.open(url, '_blank');
  }
  // Reschedule
  openRescheduleModal(data) {
    this.rescheduleModalContent = data;
    this.rescheduleModalContent.date = null;
    $(this.rescheduleModal.nativeElement).modal('show');
  }
  updateReschedule() {
    const { date, orderID } = this.rescheduleModalContent;
    if (!date) {
      this._dashboardService.snackBar('Date is required');
      return;
    }
    this.rescheduleModalContent.rescheduleLoader = true;
    let payload = {
      orderID: orderID,
      theDate: moment(date).format('mm/DD/yyyy'),
      reschedule_artwork: true
    }
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.rescheduleModalContent.rescheduleLoader = true;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["message"]) {
        this._dashboardService.snackBar(res["message"]);
      }
      $(this.rescheduleModal.nativeElement).modal('hide');
    });
  }
  // Update Priority
  updatePriority(order, type) {
    const { orderID, priorityChecked } = order;
    let payload: any;
    if (priorityChecked) {
      payload = {
        orderID: orderID,
        dashboardType: type,
        add_mark_priority: true
      }
    } else {
      payload = {
        orderID: orderID,
        dashboardType: type,
        delete_mark_priority: true
      }
    }
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { });
  }
  changeStore(type, event) {
    if (type == 'waiting') {
      this.approvalOrdersLoader = true;
      this.approvalOrders = null;
      if (event.value == 'All') {
        this.approvalOrders = this.tempApprovalOrders;
      } else {
        const index = this.approvalOrdersStores.findIndex(store => store.store == event.value);
        this.approvalOrders = this.approvalOrdersStores[index].data;
      }
      setTimeout(() => {
        this.approvalOrdersLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    } else if (type == 'payment') {
      this.awaitingOrdersLoader = true;
      this.awaitingOrders = null;
      if (event.value == 'All') {
        this.awaitingOrders = this.tempAwaitingOrders;
      } else {
        const index = this.awaitingOrdersStores.findIndex(store => store.store == event.value);
        this.awaitingOrders = this.awaitingOrdersStores[index].data;
      }
      setTimeout(() => {
        this.awaitingOrdersLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    } else if (type == 'processing') {
      this.processingOrdersLoader = true;
      this.processingOrders = null;
      if (event.value == 'All') {
        this.processingOrders = this.tempProcessingOrders;
      } else {
        const index = this.processingOrdersStores.findIndex(store => store.store == event.value);
        this.processingOrders = this.processingOrdersStores[index].data;
      }
      setTimeout(() => {
        this.processingOrdersLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    }
  }
  trackByOrderId(index: number, item: any): string {
    return item.orderID;
  }
  openOrderDetailsModal(data) {
    this.orderDetailsModalContent = data;
    this.orderDetailsModalContent.loader = true;
    this.getOrderArtworkDetails();
    $(this.orderDetailsModal.nativeElement).modal('show');
  }
  getOrderArtworkDetails() {
    let params = {
      order_artwork_details: true,
      order_id: this.orderDetailsModalContent.orderID
    }
    this._dashboardService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.orderDetailsModalContent.loader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      res["data"].forEach(element => {
        element.imprints = []
        if (element.imprintDetails) {
          let imprints = element.imprintDetails.split(',,');
          imprints.forEach(imprint => {
            const [location, method, id, status] = imprint.split('||');
            element.imprints.push({ location, method, id, status })
          });
        }
      });
      this.orderDetailsModalContent.artworkData = res["data"];
    });
  }
  checkIfImageExists(url) {
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
          reject(false);
        };
      }
    });
  }
  openEmailDetailsModal(data, type) {
    this.emailModalContent = null;
    this.emailModalContent = data;
    this.emailModalContent.blnImages = true;
    this.emailModalContent.blnContent = true;
    this.emailModalContent.sendEmailLoader = false;
    this.emailModalContent.type = type;
    if (type == 'awaiting') {
      this.emailModalContent.modalTitle = 'PROOF REMINDER EMAIL FOR ORDER';
      this.emailModalContent.subject = 'Artwork approval needed for your order';
    } else {
      this.emailModalContent.modalTitle = 'PAYMENT NOTIFICATION REMINDER EMAIL FOR ORDER';
      this.emailModalContent.subject = 'Requesting payment for your order';
    }
    this.emailModalContent.loader = true;
    this.getEmailModalData(type);
    $(this.orderEmailModal.nativeElement).modal('show');
  }
  getEmailModalData(type) {
    let payload = {
      orderID: this.emailModalContent.orderID,
      storeID: this.emailModalContent.storeID,
      storeUserID: this.emailModalContent.storeUserID,
      get_order_email_data: true
    }
    this._dashboardService.postDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.emailModalContent.response = res;
      let message = '';
      let footer = '';
      let greeting = '';
      if (type == 'awaiting') {
        greeting = 'Hi';
        // Body 
        if (res["qryStoreDefaultEmails"][0].rescheduleFollowUp) {
          message = res["qryStoreDefaultEmails"][0].rescheduleFollowUp;
        } else {
          message = `We were working on the proofs for your order ${this.emailModalContent.orderID} through ${this.emailModalContent.storeName}, and just wanted to make sure that you were receiving the proofs through our system.  For the sake of time and convenience, links to all proofs that still need reviewed on this order are below.<br /><br />
          Please let us know what you think, and if any changes are needed. <br /><br /> I hope this email finds you well! <br /><br /> Thank you!`
        }
        // Footer
        if (res["data"].localPmID) {
          footer = `<div class="row">
          <div class="col-12 p-5">
                <h2 class="font-weight-bold text-xl" style="font-size: 16px; font-weight: bold; color: ##333333; font-family: Arial, Helvetica, sans-serif; margin: 0 0 0 0; padding: 0; text-decoration: none; border: none;">${res["data"].localProgramManager}</h2>
                <h3 class="font-weight-bold text-xl text-secondary" style="font-size: 14px; color: ##999999; font-family: Arial, Helvetica, sans-serif; margin: 0 0 10px 0; padding: 0;">${res["data"].localRole}</h2>
                526 S. Main Street, ##804 Akron, Ohio 44311<br />
                (d) ${res["data"].localPhone} | (p) 866.PromoHelp<br />
                (e) <a href="mailto:${res["data"].localEmail}">${res["data"].localEmail}</a><br /><br />
                <img class="w-50" src="${environment.assetsURL}globalAssets/Stores/mastheads/${this.emailModalContent.storeID}.gif" />
              </div>
            </div>`
        }
      } else {
        const hash = CryptoJS.MD5(`storeID=${this.emailModalContent.storeID}&orderID=${this.emailModalContent.orderID}`);
        const hashedValue = hash.toString(CryptoJS.enc.Hex);
        greeting = 'Dear';
        // Body 
        if (res["qryStoreDefaultEmails"][0].paymentNotification) {
          message = res["qryStoreDefaultEmails"][0].paymentNotification;
        } else {
          message = `The artwork has been approved for your order ${this.emailModalContent.orderID} through ${this.emailModalContent.storeName}. We are now just awaiting payment or payment information.  Once received, your order will move to production. <br /><br /> You can use <a href="${environment.ppCheckout}?orderID=${this.emailModalContent.orderID}&h=${hashedValue}&TPE=${res["orderData"][0].billingEmail}&UE=${res["orderData"][0].billingEmail}">this link</a> to pay online, or simply reply with payment information, questions, or concerns. <br /><br /> <br /><br /> Thank you!`
        }
        const url = `${environment.ppCheckout}?orderID=${this.emailModalContent.orderID}&h=${hashedValue}&TPE=${res["orderData"][0].billingEmail}&UE=${res["orderData"][0].billingEmail}`;
        this.emailModalContent.text = `<div style="font-size: 12px; color: ##999;">If the above payment link does not work, you can copy and paste this link into the address bar of your browser:<br /><a target="_blank" href="${url}"><code>${url}</code></a></div>`
      }
      if (res["qryOrderLines"].length) {
        res["qryOrderLines"].forEach(element => {
          const virtualProofPath = `/globalAssets/StoreUsers/VirtualProofs/${res["orderData"][0].storeUser_pk_userID}/${this.emailModalContent.orderID}/${element.pk_orderLineID}`;
          element.hasImprints = false;
          element.imprints = [];
          if (element.qryOrderLineImprints) {
            let imprints = element.qryOrderLineImprints.split('#_');
            imprints.forEach((imprint, index) => {
              let [IID, location, method, status, approvingStoreUserID] = imprint.split('||');
              if (!element.hasImprints) {
                element.hasImprints = [3, 12, 13].some(s => status.includes(s));
                if (element.hasImprints) {
                  this.getFilesFromPath(virtualProofPath).then((proofs: any) => {
                    if (proofs) {
                      if (proofs.length) {
                        element.imageUrl = environment.assetsURL + `globalAssets/StoreUsers/VirtualProofs/${res["orderData"][0].storeUser_pk_userID}/${this.emailModalContent.orderID}/${element.pk_orderLineID}/${proofs[0].FILENAME}?${Date.now().toString()}`;
                        this._changeDetectorRef.markForCheck();
                      } else {
                        const imageURL = `${environment.assetsURL}globalAssets/Products/HiRes/${element.storeProductID}.jpg?${Date.now().toString()}`;
                        this.checkIfImageExists(imageURL).then(image => {
                          if (image) {
                            element.imageUrl = imageURL;
                          } else {
                            element.imageUrl = `assets/images/coming_soon.jpg`;
                          }
                          this._changeDetectorRef.markForCheck();
                        })
                      }
                    }
                  });
                }
              }
              let statusCheck = [3, 12, 13].some(s => status.includes(s));
              let proofUrl = null;
              if (statusCheck) {
                if (!approvingStoreUserID) {
                  approvingStoreUserID = res["orderData"][0].fk_storeUserID;
                }
                const { protocol, storeURL, storeUserEmail, fk_storeUserID } = res["orderData"][0];
                proofUrl = `${protocol + storeURL}/proof/approve?rEM=${this._dashboardService.getEncodedData(storeUserEmail)}&rID=${fk_storeUserID}&OLID=${element.pk_orderLineID}&IID=${IID}&approvingID=${approvingStoreUserID}`;
              }
              element.imprints.push({ IID, location, method, status, approvingStoreUserID: Number(approvingStoreUserID), statusCheck, proofUrl, checked: false });
            });
          }
        });
      }
      this.emailModalContent.body = `${greeting} ${res["orderData"][0].storeUserFirstName},<br /><br />${message}`;
      this.emailModalContent.qryOrderLines = res["qryOrderLines"];
      this.emailModalContent.footer = footer;
      this.emailModalContent.loader = false;
      this._changeDetectorRef.markForCheck();
      console.log(this.emailModalContent);
    }, err => {
      this.emailModalContent.loader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  getFilesFromPath(path) {
    return new Promise((resolve, reject) => {
      let payload = {
        files_fetch: true,
        path: path
      };

      this._dashboardService.getFiles(payload)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
          res => {
            resolve(res["data"]);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  sendEmailsOrders() {
    this.emailModalContent.sendEmailLoader = true;
    this._changeDetectorRef.markForCheck();
    // Orders waiting artwork
    let payload;
    const { storeName, orderID, subject, blnImages, blnContent, storeID, body } = this.emailModalContent;
    const { storeUserEmail, billingEmail } = this.emailModalContent.response["orderData"][0];
    const { localEmail, localPhone, localPmID, localProgramManager, localRole, ppCheckOut } = this.emailModalContent.response.data;
    if (this.emailModalContent.type == 'awaiting') {
      const emailContent = this.awaitingGenerateTable();
      payload = {
        orderID,
        copy: body,
        subject,
        blnImages, blnContent,
        contentHtml: emailContent,
        productRemoveList: '',
        userEmail: storeUserEmail,
        storeName, storeID, localPmID, localProgramManager, localPhone, localEmail, localRole, ppCheckOut,
        send_artwork_reminder_email: true
      }
    } else {
      payload = {
        orderID, billingEmail, storeUserEmail, subject, storeName, storeID, localPmID, localProgramManager, localPhone, localEmail, localRole, ppCheckOut,
        copy: body,
        pdfFilename: '',
        send_payment_notification_email: true
      }
    }
    this._dashboardService.postDashboardData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.emailModalContent.sendEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res) {
        this._dashboardService.snackBar(res["message"]);
        if (this.emailModalContent.type == 'awaiting') {

        } else {
          this.awaitingOrders.forEach(order => {
            if (order.orderID === orderID) {
              order.paymentNotification = res["currentDate"];
            }
          });
        }
      }
      $(this.orderEmailModal.nativeElement).modal('hide');
      console.log(res);
    });
  }

  awaitingGenerateTable(): string {
    let tableHTML = `<table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tbody>`;
    for (const product of this.emailModalContent.qryOrderLines) {
      if (product.hasImprints) {
        tableHTML += `<tr style="margin-bottom: 8px;">
          <td style="width: 30%;">
            <img src="${product.imageUrl}" style="width: 100%;">
          </td>
          <td style="width: 70%;">
            <h2 style="font-weight: bold; margin: 0;">${product.productName}</h2>`;

        for (const imprint of product.imprints) {
          if (!imprint.checked) {
            tableHTML += `<div style="border-bottom: 1px solid #000; padding-bottom: 8px;">
            <p style="font-weight: bold; color: #777; margin: 0;">
              ${imprint.location + '/' + imprint.method}
            </p>`;

            if (imprint.statusCheck) {
              tableHTML += `<a href="${imprint.proofUrl}" target="_blank" style="color: #007bff; text-decoration: none;">
              CLICK HERE TO REVIEW THIS PROOF
            </a>`;
            }

            tableHTML += `</div>`;
          }
        }

        tableHTML += `</td>
        </tr>`;
      }
    }

    tableHTML += `</tbody>
    </table>`;

    return tableHTML;
  }

}
