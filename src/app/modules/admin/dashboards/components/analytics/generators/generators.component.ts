import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardsService } from '../../../dashboard.service';
import { finalize, map, skipWhile, take, takeUntil } from 'rxjs/operators';
import { Subject, forkJoin, of } from 'rxjs';
import { environment } from 'environments/environment';
import CryptoJS from 'crypto-js';
declare var $: any;

@Component({
  selector: 'app-order-generators',
  templateUrl: './generators.component.html',
  styleUrls: ['./generators.component.scss']
})
export class GeneratorsComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('quoteEmailModal') quoteEmailModal: ElementRef;
  @ViewChild('quoteDetailsModal') quoteDetailsModal: ElementRef;
  @ViewChild('sampleCommentModal') sampleCommentModal: ElementRef;
  sampleCommentModalData: any;
  isLoading: boolean = false;
  pendingQuotes: any = [];
  pendingQuotesLoader: boolean = false;
  tempPendingQuotes: any = [];
  pendingStores: any = [];
  ngPendingStore = 'All';
  sampleStatus: any = [];
  sampleStatusLoader: boolean = false;
  ngSampleStore = 'All';
  tempSampleStatus: any = [];
  sampleStores: any = [];
  ordersThisYear: any = [];
  ordersThisYearLoader: boolean = false;
  ngOrderStore = 'All';
  tempOrdersThisYear: any = [];
  orderStores: any = [];
  keywordsData: any = [];
  activityData: any = [];
  activityDataLoader: boolean = false;
  ngActivityStore = 'All';
  tempActivityData: any = [];
  activityStores: any = [];
  @Input() userData: any;
  orderDetailsModalContent: any;
  pendingQuotesDtOption: any;
  sampleDtOption: any;
  aroundDtOption: any;
  keywordDtOption: any;
  postDtOption: any;

  editorConfig = {
    toolbar: [
      { name: 'clipboard', items: ['Undo', 'Redo'] },
      { name: 'styles', items: ['Format'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike'] },
      { name: 'align', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      { name: 'links', items: ['Link', 'Unlink'] },
      { name: 'insert', items: ['Image', 'Table'] },
      { name: 'tools', items: ['Maximize'] },
    ],
    extraPlugins: 'uploadimage,image2',
    uploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
    filebrowserUploadMethod: 'base64',
    // Configure your file manager integration. This example uses CKFinder 3 for PHP.
    filebrowserBrowseUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html',
    filebrowserImageBrowseUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/ckfinder.html?type=Images',
    filebrowserUploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Files',
    filebrowserImageUploadUrl:
      'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Images'
    // other options
  };
  emailModalContent: any;
  assetURL = environment.assetsURL;

  isOtherGeneratorLoader: boolean = false;
  totalConversion: any;
  conversionCount = 1;
  sampleCount = 0;
  constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dashboardService: DashboardsService,
  ) { }

  ngOnInit(): void {
    this.pendingQuotesDtOption = {
      order: [[2, 'desc']],
    }
    this.sampleDtOption = {
      order: [[3, 'desc']],
    }
    this.aroundDtOption = {
      order: [[1, 'desc']],
    }
    this.keywordDtOption = {
      order: [[0, 'asc']],
    }
    this.postDtOption = {
      order: [[3, 'desc']],
    }
    this.isLoading = true;
    this.isOtherGeneratorLoader = true;
    this.getOrdersStatus();
  }
  getOrdersStatus() {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    this.pendingQuotes = [];
    this.tempPendingQuotes = [];
    this.pendingStores = [];
    this.sampleStatus = [];
    this.tempSampleStatus = [];
    this.sampleStores = [];

    this.keywordsData = [];

    let params = {
      generator_reports: true,
      user_id: userDetails.pk_userID,
      flpsUserID: userDetails.FLPSUserID
    }
    this._dashboardService.getDashboardData(params).pipe(skipWhile(obj => !obj), take(1), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["pendingQuotes"]) {
        this.pendingQuotes = res["pendingQuotes"]?.pendingQuotesResponse;
        this.tempPendingQuotes = res["pendingQuotes"]?.pendingQuotesResponse;
        this.pendingStores = res["pendingQuotes"]?.pendingStores;
      }

      // Sample Orders
      if (res["sampleOrders"]) {
        this.sampleStatus = res["sampleOrders"]?.sampleOrdersResponse.filter(item => item.blnSampleConverted == '0');
        this.tempSampleStatus = res["sampleOrders"]?.sampleOrdersResponse.filter(item => item.blnSampleConverted == '0');
        this.sampleStores = res["sampleOrders"]?.sampleOrdersStores;
        this.sampleCount = 0;
        this.conversionCount = res["qryQuarterSamplesCount"][0].qryQuarterSamplesCount;
        res["sampleOrders"]?.sampleOrdersResponse.forEach(order => {
          if (order.blnSampleConverted != '0') {
            this.sampleCount++;
          }
        });
        this.totalConversion = `Conversion rate:  <b>${this.sampleCount}/${this.conversionCount} (${((this.sampleCount / this.conversionCount) * 100).toFixed(2)}%)</b>`
      }
      this.keywordsData = res["keywords"];
      // Other Generators
      this.getOtherOrderStatus();
      this._changeDetectorRef.markForCheck();

    })
  }
  getOtherOrderStatus() {
    this.ordersThisYear = [];
    this.tempOrdersThisYear = [];
    this.orderStores = [];

    this.activityData = [];
    this.tempActivityData = [];
    this.activityStores = [];

    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    let params = {
      generator_other_reports: true,
      user_id: userDetails.pk_userID,
      flpsUserID: userDetails.FLPSUserID
    }
    this._dashboardService.getDashboardData(params).pipe(skipWhile(obj => !obj), take(1), finalize(() => {
      this.isOtherGeneratorLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.ordersThisYear = res["data"][0];
      this.ordersThisYear.forEach(element => {
        // Around
        if (element?.priority > 0) {
          element.backgroundColorClass = 'background-color-e0f0d5';
        } else if (element.fk_groupOrderID) {
          element.backgroundColorClass = 'background-color-fca769';
        } else if (element.inHandsDate !== 'N/A' && element.inHandsDate) {
          element.backgroundColorClass = 'background-color-ffcaca';
        } else if (element.blnReorder) {
          element.backgroundColorClass = 'background-color-feee84';
        } else {
          element.backgroundColorClass = ''; // Default or fallback class if none of the conditions are met
        }
        if (element.customerLastYearPriority > 0) {
          element.priorityChecked = true;
        } else {
          element.priorityChecked = false;
        }
        const existingStoreIndex = this.orderStores.findIndex(store => store.store === element.storeName);

        if (existingStoreIndex > -1) {
          // Store already exists, add data to existing store
          this.orderStores[existingStoreIndex].data.push(element);
        } else {
          // Store does not exist, add a new store
          this.orderStores.push({
            store: element.storeName,
            data: [element]
          });
        }
      });
      this.tempOrdersThisYear = this.ordersThisYear;
      this.activityData = res["data"][1];
      this.activityData.forEach(element => {
        if (element?.priority > 0) {
          element.backgroundColorClass = 'background-color-e0f0d5';
        } else if (element.fk_groupOrderID) {
          element.backgroundColorClass = 'background-color-fca769';
        } else if (element.inHandsDate !== 'N/A' && element.inHandsDate) {
          element.backgroundColorClass = 'background-color-ffcaca';
        } else if (element.blnReorder) {
          element.backgroundColorClass = 'background-color-feee84';
        } else {
          element.backgroundColorClass = ''; // Default or fallback class if none of the conditions are met
        }
        if (element.followUpPriority > 0) {
          element.priorityChecked = true;
        } else {
          element.priorityChecked = false;
        }
        const existingStoreIndex = this.activityStores.findIndex(store => store.store === element.storeName);

        if (existingStoreIndex > -1) {
          // Store already exists, add data to existing store
          this.activityStores[existingStoreIndex].data.push(element);
        } else {
          // Store does not exist, add a new store
          this.activityStores.push({
            store: element.storeName,
            data: [element]
          });
        }
      });
      this.tempActivityData = this.activityData;
    });
  }

  // Update Priority
  updateQuotePriority(quote, type) {
    const { cartID, priorityChecked } = quote;
    let payload: any;
    if (priorityChecked) {
      payload = {
        cartID: cartID,
        dashboardType: type,
        add_quote_mark_priority: true
      }
    } else {
      payload = {
        cartID: cartID,
        dashboardType: type,
        delete_quote_mark_priority: true
      }
    }
    this.pendingQuotes.forEach(item => {
      if (item.cartID == cartID) {
        item.priorityChecked = priorityChecked;
        if (priorityChecked) {
          item.backgroundColorClass = 'background-color-e0f0d5';
        } else {
          item.backgroundColorClass = '';
        }
      }
    })
    this._changeDetectorRef.markForCheck();
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {

    });
  }
  updatePriority(order, type) {
    let orderID;
    const { priorityChecked } = order;
    if (type == 'blnSample') {
      orderID = order.orderID;
    } else {
      orderID = order.pk_orderID;
    }
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
    if (type == 'blnSample') {
      this.sampleStatus.forEach(item => {
        if (item.orderID == orderID) {
          item.priorityChecked = priorityChecked;
          if (priorityChecked) {
            item.priority = 1;
          } else {
            item.priority = 0;
          }
        }
      })
    } else if (type == 'blnCustomerLastYear') {
      this.ordersThisYear.forEach(item => {
        if (item.pk_orderID == orderID) {
          item.priorityChecked = priorityChecked;
          if (priorityChecked) {
            item.backgroundColorClass = 'background-color-e0f0d5';
          } else {
            item.backgroundColorClass = '';
          }
        }
      })
    } else if (type == 'blnFollowUp') {
      this.activityData.forEach(item => {
        if (item.pk_orderID == orderID) {
          item.priorityChecked = priorityChecked;
          if (priorityChecked) {
            item.backgroundColorClass = 'background-color-e0f0d5';
          } else {
            item.backgroundColorClass = '';
          }
        }
      })
    }

    this._changeDetectorRef.markForCheck();
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { });
  }
  // Remove Quotes
  removeQuotes(quote) {
    const { cartID } = quote;
    let payload = {
      cartID: cartID,
      remove_quote: true,
    }
    quote.delLoader = true;
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      quote.delLoader = false;
      this.pendingQuotesLoader = true;
      let pendingQuotes = this.pendingQuotes.filter(item => item.cartID != cartID);
      setTimeout(() => {
        this.pendingQuotesLoader = false;
        this.pendingQuotes = pendingQuotes;
        this._changeDetectorRef.markForCheck();
      }, 200);
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["message"]) {
        this._dashboardService.snackBar(res["message"]);
        this.pendingQuotes = this.pendingQuotes.filter(item => item.cartID != cartID);
      }
    });
  }
  // Remove Orders
  removeOrders(order, type) {
    let user = JSON.parse(localStorage.getItem('userDetails'));

    let orderID;
    let storeUserID;
    if (type == 'blnSample') {
      orderID = order.orderID;
      storeUserID = order.storeUserID;
    } else if (type == 'blnCustomerLastYear') {
      orderID = order.pk_orderID;
      storeUserID = order.fk_storeUserID;
    } else if (type == 'blnFollowUp') {
      orderID = order.pk_orderID;
      storeUserID = order.fk_storeUserID;
    }
    let payload = {
      orderID: orderID,
      pk_userID: user.pk_userID,
      dashboardType: type,
      remove_dashboard_order: true
    }
    order.delLoader = true;
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      order.delLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["message"]) {
        this._dashboardService.snackBar(res["message"]);
        if (type == 'blnSample') {
          this.sampleStatusLoader = true;
          setTimeout(() => {
            this.sampleStatus = this.sampleStatus.filter(item => item.orderID != orderID);
            this.sampleStatusLoader = false;
            this._changeDetectorRef.markForCheck();
          }, 200);
        } else if (type == 'blnCustomerLastYear') {
          this.ordersThisYearLoader = true;
          setTimeout(() => {
            this.ordersThisYearLoader = false;
            this.ordersThisYear = this.ordersThisYear.filter(item => item.orderID != orderID);
            this._changeDetectorRef.markForCheck();
          }, 200);
        } else if (type == 'blnFollowUp') {
          this.isOtherGeneratorLoader = true;
          setTimeout(() => {
            this.isOtherGeneratorLoader = false;
            this.activityData = this.activityData.filter(item => item.orderID != orderID);
            this._changeDetectorRef.markForCheck();
          }, 200);
        }
      }
    });
  }
  // Mark Sample Order
  markOrderAsSample(order) {
    const { orderID } = order;
    let payload = {
      orderID: orderID,
      blnOrdered: 1,
      mark_sample_order: true
    }
    order.sampleLoader = true;
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      order.sampleLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res["message"]) {
        this._dashboardService.snackBar(res["message"]);
      }
    });
  }
  changeStore(type, event) {
    if (type == 'quotes') {
      this.pendingQuotesLoader = true;
      this.pendingQuotes = null;
      if (event.value == 'All') {
        this.pendingQuotes = this.tempPendingQuotes;
      } else {
        const index = this.pendingStores.findIndex(store => store.store == event.value);
        this.pendingQuotes = this.pendingStores[index].data;
      }
      setTimeout(() => {
        this.pendingQuotesLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    } else if (type == 'samples') {
      this.sampleStatusLoader = true;
      this.sampleStatus = null;
      if (event.value == 'All') {
        this.sampleStatus = this.tempSampleStatus;
        this.totalConversion = `Conversion rate:  <b>${this.sampleCount}/${this.conversionCount} (${((this.sampleCount / this.conversionCount) * 100).toFixed(2)}%)</b>`
      } else {
        const index = this.sampleStores.findIndex(store => store.store == event.value);
        this.sampleStatus = this.sampleStores[index].data;
        this.totalConversion = `Conversion rate:  <b>${this.sampleStores[index].count}/${this.conversionCount} (${((this.sampleStores[index].count / this.conversionCount) * 100).toFixed(2)}%)</b>`
      }
      setTimeout(() => {
        this.sampleStatusLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    } else if (type == 'orders') {
      this.ordersThisYearLoader = true;
      this.ordersThisYear = null;
      if (event.value == 'All') {
        this.ordersThisYear = this.tempOrdersThisYear;
      } else {
        const index = this.orderStores.findIndex(store => store.store == event.value);
        this.ordersThisYear = this.orderStores[index].data;
      }
      setTimeout(() => {
        this.ordersThisYearLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    } else if (type == 'activity') {
      this.activityDataLoader = true;
      this.activityData = null;
      if (event.value == 'All') {
        this.activityData = this.tempActivityData;
      } else {
        const index = this.activityStores.findIndex(store => store.store == event.value);
        this.activityData = this.activityStores[index].data;
      }
      setTimeout(() => {
        this.activityDataLoader = false;
        this._changeDetectorRef.markForCheck();
      }, 500);
    }
  }
  openOrderDetailsModal(data) {
    this.orderDetailsModalContent = data;
    this.orderDetailsModalContent.loader = true;
    this.getOrderArtworkDetails();
    $(this.quoteDetailsModal.nativeElement).modal('show');
  }
  getImprintFiles(url: string) {
    let payload = {
      files_fetch: true,
      path: url
    };
    return this._dashboardService.getFiles(payload);
  }
  getOrderArtworkDetails() {
    this.orderDetailsModalContent.artworkData = [];
    let params = {
      quote_artwork_details: true,
      cart_id: this.orderDetailsModalContent.cartID
    }
    this._dashboardService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {

    })).subscribe(res => {
      if (res["data"].length == 0) {
        this.orderDetailsModalContent.artworkData = [];
        this.orderDetailsModalContent.loader = false;
        this._changeDetectorRef.markForCheck();
      } else {
        forkJoin(
          res["data"].map(element => {
            if (element.imprintDetails) {
              const url = `/artwork/Proof/Quotes/${element.storeUserID}/${element.pk_cartID}/${element.pk_cartLineID}`;
              return this.getImprintFiles(url).pipe(
                map((files: any) => {
                  const imprints = element.imprintDetails?.split('##');

                  element.imprints = (imprints || []).map(imprint => {
                    const [imprintID, location, method, status, statusID, contactName] = imprint.split('||');
                    const matchingFile = files["data"].find(file => file.FILENAME.split('.')[0] == imprintID);

                    const proofUrl = matchingFile
                      ? `${environment.assetsURL}artwork/Proof/Quotes/${element.storeUserID}/${element.pk_cartID}/${element.pk_cartLineID}/${matchingFile.FILENAME}`
                      : '';
                    return { imprintID, location, method, status, statusID, contactName, proofUrl };
                  });
                })
              );
            } else {
              return of([]);
            }
          })
        ).subscribe(() => {
          this.orderDetailsModalContent.loader = false;
          this._changeDetectorRef.markForCheck();
          this.orderDetailsModalContent.artworkData = res["data"];
        }, err => {
          this.orderDetailsModalContent.loader = false;
          this._changeDetectorRef.markForCheck();
        });
      }

    });
  }
  trackByCartId(index: number, item: any): any {
    return index;
  }
  openEmailDetailsModal(data, type) {
    this.emailModalContent = null;
    this.emailModalContent = {
      ...data,
      type: type,
      loader: true
    };

    switch (type) {
      case 'sample':
        this.emailModalContent.modalTitle = `SAMPLE CONVERSION EMAIL FOR ${data.orderID}`;
        this.emailModalContent.subject = 'How did you like your sample?';
        break;
      case 'reorder':
        this.emailModalContent.modalTitle = `REORDER REMINDER EMAIL FOR ORDER ${data.pk_orderID}`;
        this.emailModalContent.subject = 'Checking in on your order';
        break;
      case 'follow':
        this.emailModalContent.modalTitle = `FOLLOW UP EMAIL FOR ORDER ${data.pk_orderID}`;
        this.emailModalContent.subject = 'Following Up';
        break;
      case 'survey':
        this.emailModalContent.modalTitle = `CUSTOMER SURVEY FOR ORDER ${data.pk_orderID}`;
        this.emailModalContent.subject = 'How was your experience using the Rutgers Swag Portal?';
        break;
      case 'quotes':
        this.emailModalContent.modalTitle = `QUOTE FOLLOW UP EMAIL FOR QUOTE ${data.cartID}`;
        this.emailModalContent.subject = 'Following Up On Your Recent Quote';
        break;
    }

    this.getEmailModalData(type);
    $(this.quoteEmailModal.nativeElement).modal('show');



  }
  getEmailModalData(type) {
    let payload;
    switch (type) {
      case 'sample':
        payload = {
          orderID: this.emailModalContent.orderID,
          storeID: this.emailModalContent.storeID,
          storeUserID: this.emailModalContent.storeUserID,
          get_order_email_data: true
        };
        break;
      case 'reorder':
        payload = {
          orderID: this.emailModalContent.pk_orderID,
          storeID: this.emailModalContent.fk_storeID,
          storeUserID: this.emailModalContent.fk_storeUserID,
          get_order_email_data: true
        };
        break;
      case 'follow':
        payload = {
          orderID: this.emailModalContent.pk_orderID,
          storeID: this.emailModalContent.fk_storeID,
          storeUserID: this.emailModalContent.fk_storeUserID,
          get_order_email_data: true
        };
        break;
      case 'quotes':
        payload = {
          cartID: this.emailModalContent.cartID,
          storeID: this.emailModalContent.storeID,
          storeUserID: this.emailModalContent.storeUserID,
          get_quote_email_data: true
        };
        break;
      case 'survey':
        payload = {
          orderID: this.emailModalContent.pk_orderID,
          storeID: this.emailModalContent.fk_storeID,
          storeUserID: this.emailModalContent.fk_storeUserID,
          get_order_email_data: true
        };
        this.emailModalContent.surveys = [];
        break;
    }
    this._dashboardService.postDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.emailModalContent.response = res;
      let message = '';
      let footer = '';
      let greeting = '';
      if (type == 'sample') {
        greeting = 'Hello';
        // Body 
        if (res["qryStoreDefaultEmails"][0].sampleEmail) {
          message = `${res["orderData"][0].storeUserFirstName} <br /> ${res["qryStoreDefaultEmails"][0].sampleEmail}`;
        } else {
          message = `${res["orderData"][0].storeUserFirstName}, <br /><br /> I wanted to reach out today because I noticed you received your sample${res["qryOrderLines"].length > 1 ? 's' : ''} of the item${res["qryOrderLines"].length > 1 ? 's' : ''} below.  How did ${res["qryOrderLines"].length > 1 ? 'they' : 'it'} turn out?  As you know, it is our goal to exceed your expectations, and we would love to hear your feedback.<br /><br /> If the sample${res["qryOrderLines"].length > 1 ? 's' : ''} did not suit your needs, let me know, and I can help you find the perfect product!<br /><br /> Thank you!`;
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
      } else if (type == 'reorder') {
        greeting = 'Hello';
        // Body 
        if (res["qryStoreDefaultEmails"][0].followUpEmail) {
          message = `${res["orderData"][0].storeUserFirstName} <br /> ${res["qryStoreDefaultEmails"][0].followUpEmail}`;
        } else {
          message = `${res["orderData"][0].storeUserFirstName}, <br /><br /> About this time last year, you ordered the product(s) below with us.  I wanted to check in with you and see if there is anything you are currently 
          working on or if you have any additional promotional products needs.  I would be happy to get you a quote or suggest some new ideas for you. <br /><br /> It is my job to make sure we help you find the right products!  If I can be of any assistance, please don't hesitate to let me know.  Of course, you can visit your store, <a href="${res["orderData"][0].protocol + res["orderData"][0].storeURL}">${res["orderData"][0].storeName}</a>, for a great selection of custom branded products or to request a quote.<br /><br /> Thank you!`;
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
                <img class="w-50" src="${environment.assetsURL}globalAssets/Stores/mastheads/${this.emailModalContent.fk_storeID}.gif" />
              </div>
            </div>`
        }
      } else if (type == 'follow') {
        greeting = 'Hello';
        // Body 
        if (res["qryStoreDefaultEmails"][0].reorderEmail) {
          message = `${res["orderData"][0].storeUserFirstName} <br /> ${res["qryStoreDefaultEmails"][0].reorderEmail}`;
        } else {
          message = `${res["orderData"][0].storeUserFirstName}, <br /><br /> I wanted to reach out because I noticed you received your recent order!  How did everything turn out?  As you know, it is always our goal to exceed your expectations so please let us know how we did.<br /><br />
          Please provide some feedback about the quality of the products and/or service you received.  I would greatly appreciate it!  <u>Simply click on the link below to provide a review or just reply to this email and I can do it for you.</u>`;
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
                <img class="w-50" src="${environment.assetsURL}globalAssets/Stores/mastheads/${this.emailModalContent.fk_storeID}.gif" />
              </div>
            </div>`
        }
      } else if (type == 'quotes') {
        greeting = 'Hello';
        // Body 
        if (res["qryStoreDefaultEmails"][0].quoteEmail) {
          message = `${res["cartData"][0].storeUserFirstName} <br /> ${res["qryStoreDefaultEmails"][0].quoteEmail}`;
        } else {
          message = `${res["cartData"][0].storeUserFirstName}, <br /><br /> I wanted to reach out to follow up on the recent quote you created, which is included below.`;
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
      } else if (type == 'survey') {
        if (res["qryStoreDefaultEmails"][0].surveyEmailSubject) {
          this.emailModalContent.subject = res["qryStoreDefaultEmails"][0].surveyEmailSubject
        }
        greeting = 'Hi';
        // Body 
        if (res["qryStoreDefaultEmails"][0].surveyEmail) {
          message = `<br /> ${res["qryStoreDefaultEmails"][0].surveyEmail}`;
        } else {
          message = `You are receiving this this invite because you recently placed an order on ${res["orderData"][0].storeName}. We actively use feedback to improve your experience and provide you with the best possible service.<br /><br />This survey should take less than 5 minutes.<br /><b><u><a href="${res["orderData"][0].protocol}${res["orderData"][0].storeURL}/survey?s=">Click here to take the survey.</a></u></b><br /><br />`;
        }
        // Footer
        if (res["data"].localPmID) {
          footer = `<br /><br />
          If you have any questions, please contact ${res["data"].localProgramManager} at ${res["data"].localPhone} or <a href="mailto:service@${res["orderData"][0].storeURL}">service@${res["orderData"][0].storeName}</a> 
          
          <div class="row">
          <div class="col-12 p-5">
                <h2 class="font-weight-bold text-xl" style="font-size: 16px; font-weight: bold; color: ##333333; font-family: Arial, Helvetica, sans-serif; margin: 0 0 0 0; padding: 0; text-decoration: none; border: none;">${res["data"].localProgramManager}</h2>
                <h3 class="font-weight-bold text-xl text-secondary" style="font-size: 14px; color: ##999999; font-family: Arial, Helvetica, sans-serif; margin: 0 0 10px 0; padding: 0;">${res["data"].localRole}</h2>
                526 S. Main Street, ##804 Akron, Ohio 44311<br />
                (d) ${res["data"].localPhone} | (p) 866.PromoHelp<br />
                (e) <a href="mailto:${res["data"].localEmail}">${res["data"].localEmail}</a><br /><br />
                <img class="w-50" src="${environment.assetsURL}globalAssets/Stores/mastheads/${this.emailModalContent.fk_storeID}.gif" />
              </div>
            </div>`
        }
      }
      if (type != 'quotes' && type != 'survey') {
        if (res["qryOrderLines"].length) {
          res["qryOrderLines"].forEach(element => {
            element.checked = false;
            const virtualProofPath = `/globalAssets/StoreUsers/VirtualProofs/${res["orderData"][0].storeUser_pk_userID}/${this.emailModalContent.orderID}/${element.pk_orderLineID}`;
            this.getFilesFromPath(virtualProofPath).then((proofs: any) => {
              if (proofs) {
                if (proofs.length) {
                  element.imageUrl = environment.assetsURL + `globalAssets/StoreUsers/VirtualProofs/${res["orderData"][0].storeUser_pk_userID}/${this.emailModalContent.orderID}/${element.pk_orderLineID}/${proofs[0].FILENAME}?${Date.now().toString()}`;
                } else {
                  const imageURL = `${environment.assetsURL}globalAssets/Products/HiRes/${element.storeProductID}.jpg?${Date.now().toString()}`;
                  this.checkIfImageExists(imageURL).then(image => {
                    if (image) {
                      element.imageUrl = imageURL;
                    } else {
                      element.imageUrl = `assets/images/coming_soon.jpg`;
                    }
                    this._changeDetectorRef.markForCheck();
                  });
                  this._changeDetectorRef.markForCheck();
                }
              }
            });
            if (type == 'reorder' || type == 'follow') {
              const { protocol, storeName, storeURL, storeUserEmail, fk_storeUserID } = res["orderData"][0];
              const { pk_orderID, fk_storeID } = this.emailModalContent;
              const hash = CryptoJS.MD5(`storeID=${fk_storeID}`);
              const hashedValue = hash.toString(CryptoJS.enc.Hex);
              element.reorderURL = `${protocol}${storeURL}/account/orders/${pk_orderID}?rID=${fk_storeUserID}&h=${hashedValue}&orderID=${pk_orderID}&uE=${storeUserEmail}&oID=${pk_orderID}`;

              element.reviewURL = `${protocol}${storeURL}/review?pID=${element.storeProductID}&email=${storeUserEmail}&orderID=${pk_orderID}&OLID=${element.pk_orderLineID}`;
            }
          });
        }
        this.emailModalContent.body = `${greeting} ${res["orderData"][0].storeUserFirstName},<br /><br />${message}`;
        this.emailModalContent.qryOrderLines = res["qryOrderLines"];
        this.emailModalContent.footer = footer;
      } else if (type == 'quotes') {
        this.emailModalContent.totalPrice = 0;
        res["cartData"].forEach(carts => {
          carts.setupsTotal = 0;
          carts.artworkFiles = [];
          carts.subTotal = Number(carts.royaltyPrice) + Number(carts.shippingGroundPrice);
          this.emailModalContent.totalPrice -= Number(carts.shippingGroundPrice);
          // Colors Data
          carts.ColorsData = (carts.Colors || '').split('#_').map(color => {
            const [colorName, unitPrice, totalPrice, sizeName] = color.split('||');
            carts.subTotal += Number(totalPrice);
            return { colorName: colorName + ' & ' + sizeName, unitPrice: Number(unitPrice), totalPrice: Number(totalPrice) };
          });
          // Decorations Data
          carts.DecorationData = (carts.Decoration || '').split('#_').map(decoration => {
            const [id, locationName, methodName, setupPrice, price, colors, logoID, runningPrice] = decoration.split('||');
            carts.subTotal += Number(runningPrice);
            carts.setupsTotal += Number(setupPrice);
            this.getArworkFiles(carts, id, logoID);
            return { locationName, methodName, runPrice: Number(price), setupPrice: Number(setupPrice), logoBankID: logoID, colors, runningPrice: Number(runningPrice) };
          });
          this.emailModalContent.totalPrice += carts.subTotal;
          this.emailModalContent.body = `${greeting} ${message}`;
          this.emailModalContent.footer = footer;
        });

        this.emailModalContent.cartData = res["cartData"];
      } else if (type == 'survey') {
        this.emailModalContent.surveyID = 0;
        this.emailModalContent.surveys = [];
        if (res["orderData"].length) {
          if (res["orderData"][0].surveys) {
            let surveys = res["orderData"][0].surveys.split(',,');
            surveys.forEach(survey => {
              const [id, name] = survey.split('::');
              this.emailModalContent.surveys.push({ id, name });
              this._changeDetectorRef.markForCheck();
            });
            this.emailModalContent.body = `${greeting} ${res["orderData"][0].storeUserFirstName},<br /><br />${message}`;
            this.emailModalContent.footer = footer;
          } else {
            this.emailModalContent.surveys = [];
          }
        } else {
          this.emailModalContent.surveys = [];
        }
      }
      this.emailModalContent.loader = false;
      this._changeDetectorRef.markForCheck();
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
  getArworkFiles(data, imprintID, logoID) {
    let payload = {
      files_fetch: true,
      path: `/artwork/temp/${data.pk_cartID}/${data.pk_cartLineID}/${imprintID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._dashboardService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      files["data"].forEach(file => {
        file.imprintID = imprintID;
        file.logoBankID = logoID;
        data.artworkFiles.push(file);
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }

  sendEmailsOrders() {
    let user = JSON.parse(localStorage.getItem('userDetails'));
    const emailContent = this.generateEmailTable();
    this.emailModalContent.sendEmailLoader = true;
    this._changeDetectorRef.markForCheck();
    // Orders waiting artwork
    let payload;
    const { localEmail, localPhone, localPmID, localProgramManager, localRole, ppCheckOut } = this.emailModalContent.response.data;
    if (this.emailModalContent.type == 'sample') {
      const { storeName, orderID, subject, blnImages, blnContent, storeID, body } = this.emailModalContent;
      const { storeUserEmail, billingEmail } = this.emailModalContent.response["orderData"][0];
      payload = {
        orderID,
        localPmID, localProgramManager, localPhone, localEmail, localRole,
        billingEmail,
        storeUserEmail,
        copy: body,
        subject: subject,
        contentHtml: emailContent,
        storeName,
        storeID,
        send_sample_email: true
      }
    } else if (this.emailModalContent.type == 'reorder') {
      const { storeName, pk_orderID, subject, blnImages, blnContent, storeID, body } = this.emailModalContent;
      const { storeUserEmail, billingEmail } = this.emailModalContent.response["orderData"][0];
      const emailContent = this.emailModalContent.text;
      payload = {
        orderID: pk_orderID, localPmID, localProgramManager, localPhone, localEmail, localRole,
        storeUserEmail,
        copy: body,
        subject,
        storeName, storeID,
        contentHtml: emailContent,
        send_customer_last_year: true
      }
    } else if (this.emailModalContent.type == 'follow') {
      const { storeName, pk_orderID, subject, blnImages, blnContent, storeID, body } = this.emailModalContent;
      const { storeUserEmail, billingEmail, storeUser_pk_userID } = this.emailModalContent.response["orderData"][0];
      const emailContent = this.emailModalContent.text;
      payload = {
        orderID: pk_orderID, localPmID, localProgramManager, localPhone, localEmail, localRole,
        storeUserEmail, billingEmail,
        copy: body,
        subject,
        htmlContent: emailContent,
        storeName, storeID,
        session_pk_userID: user.pk_userID,
        send_followUp_email: true
      }
    } else if (this.emailModalContent.type == 'quotes') {
      const { storeName, orderID, subject, blnImages, blnContent, storeID, body } = this.emailModalContent;
      const { storeUserEmail, billingEmail, pk_cartID } = this.emailModalContent.response["cartData"][0];

      payload = {
        cartID: pk_cartID,
        billingEmail,
        storeUserEmail,
        copy: body,
        subject,
        printableCartHtml: emailContent,
        storeName,
        storeID,
        localPmID,
        localProgramManager,
        localPhone,
        localEmail,
        localRole,
        send_quote_email: true
      }
    } else if (this.emailModalContent.type == 'survey') {
      const { storeName, pk_orderID, subject, blnImages, blnContent, surveyID, fk_storeID, body } = this.emailModalContent;
      const { storeUserEmail, storeUserFirstName, protocol, storeURL } = this.emailModalContent.response["orderData"][0];
      payload = {
        orderID: pk_orderID, localPmID, localProgramManager, localPhone, localEmail, localRole,
        storeUserEmail, storeUserFirstName,
        copy: body,
        subject,
        storeName, storeID: fk_storeID, protocol, storeURL, surveyID,
        send_survey_email: true
      }
    }
    this._dashboardService.postDashboardData(payload).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.emailModalContent.sendEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      if (res) {
        this._dashboardService.snackBar(res["message"]);
        if (this.emailModalContent.type == 'quotes') {
          this.pendingQuotes.forEach(quote => {
            if (quote.cartID === payload.cartID) {
              quote.followUp = res["currentDate"];
            }
          });
        } else if (this.emailModalContent.type == 'reorder') {
          this.ordersThisYear.forEach(order => {
            if (order.orderID === payload.orderID) {
              order.dashboardReorderLastTouch = res["currentDate"];
            }
          });
        } else if (this.emailModalContent.type == 'activityData') {
          this.ordersThisYear.forEach(order => {
            if (order.orderID === payload.orderID) {
              order.dashboardFollowUpLastTouch = res["currentDate"];
            }
          });
        } else if (this.emailModalContent.type == 'survey') {
          this.activityData.forEach(order => {
            if (order.pk_orderID === payload.orderID) {
              order.dashboardFollowUpLastTouch = res["currentDate"];
            }
          });
        }
      }
      $(this.quoteEmailModal.nativeElement).modal('hide');
      this._changeDetectorRef.markForCheck();
    });
  }
  generateEmailTable(): string {
    let tableHTML = '';
    if (this.emailModalContent.type !== 'quotes' && this.emailModalContent.type !== 'survey' && this.emailModalContent.qryOrderLines.length > 0) {
      tableHTML += `<table width="100%" cellspacing="0" cellpadding="0" border="0">
        <tbody>`;

      for (const product of this.emailModalContent.qryOrderLines) {
        if (!product.checked) {
          tableHTML += `<tr style="border-bottom: 1px solid #000; padding-bottom: 10px;">
            <td style="width: 30%;"><img src="${product.imageUrl}" style="width: 30%;"></td>
            <td style="width: 70%;">
              <h2 style="font-weight: bold; margin: 0;">${product.productName}</h2>`;

          if (this.emailModalContent.type === 'sample') {
            tableHTML += `<p>Item Number: ${product.storeProductID}</p>`;
          }

          if (this.emailModalContent.type === 'reorder') {
            tableHTML += `<p>Quantity: ${product?.quantity}</p>
              <a href="${product?.reorderURL}" target="_blank" style="text-decoration: none; color: #007bff;">
                Click here to reorder this product.
              </a>
              <br>
              <a href="${product?.reviewURL}" target="_blank" style="text-decoration: none; color: #007bff;">
                Click here to leave a review for this product
              </a>`;
          }
          if (this.emailModalContent.type === 'follow') {
            tableHTML += `<p>Quantity: ${product?.quantity}</p>
              <br>
              <a href="${product?.reviewURL}" target="_blank" style="text-decoration: none; color: #007bff;">
                Click here to leave a review for this product
              </a>`;
          }

          tableHTML += `
            </td>
          </tr>`;
        }
      }
      tableHTML += `</tbody>
      </table>`;
    } else if (this.emailModalContent.type === 'quotes' && this.emailModalContent.cartData.length > 0) {
      tableHTML += `<table style="width: 100%; border-collapse: collapse;" cellpadding="0" cellspacing="0">
        <tbody>`;

      for (const quote of this.emailModalContent.cartData) {
        tableHTML += `<tr>
          <td style="width: 30%; padding: 10px;"><img style="display: inline; width: 40%;" src="${environment.assetsURL}globalAssets/products/HiRes/${quote.productID}.jpg" onError="this.src='${environment.assetsURL}globalAssets/Products/coming_soon.jpg'" /></td>
          <td style="width: 70%; padding: 10px;">
            <div style="margin-top: 10px; margin-bottom: 10px; font-weight: bold; font-size: 18px; color: #333;">
              (${quote.storeCode}-${quote.productID}) ${quote.productName}
            </div>
            <div style="margin-bottom: 10px; font-weight: bold; font-size: 16px; color: #333;">
              ${quote.pk_cartID}-${quote.pk_cartLineID}<br>${quote.productNumber}
            </div>
            <!-- Colors -->
            <div style="margin-bottom: 20px; font-weight: bold; font-size: 14px; color: #555;">
              Colors & Sizes
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #555; margin-bottom: 5px;">
                <div style="width: 60%;">&nbsp;</div>
                <div style="width: 20%;">Unit</div>
                <div style="width: 20%;">Total</div>
              </div>`;

        for (const color of quote.ColorsData) {
          tableHTML += `<div style="display: flex; justify-content: space-between; font-size: 14px; color: #555; margin-bottom: 5px;">
              <div style="width: 60%;">${color.colorName}</div>
              <div style="width: 20%;">${'$' + color.unitPrice}</div>
              <div style="width: 20%;">${'$' + color.totalPrice}</div>
            </div>`;
        }

        tableHTML += `</div>
              <div style="margin-top: 10px; font-weight: bold; font-size: 14px; color: #555;">Total Quantity: ${quote.orderQuantity}</div>
              <!-- Decorations -->
              <div style="margin-bottom: 20px; font-weight: bold; font-size: 14px; color: #555;">
                Decoration
              </div>
              <div>`;

        for (const decoration of quote.DecorationData) {
          tableHTML += `<div style="display: flex; justify-content: space-between; font-size: 14px; color: #555; margin-bottom: 5px;">
              <div style="width: 60%;">${decoration.locationName} / ${decoration.methodName}</div>
              <div style="width: 20%;">&nbsp;</div>
              <div style="width: 20%;">${'$' + decoration.price}</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #555; margin-bottom: 5px;">
              <div style="width: 60%;">Setup: ${'$' + decoration.setupPrice}</div>
              <div style="width: 20%;">&nbsp;</div>
              <div style="width: 20%;">&nbsp;</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #777;" *ngIf="quote.subTotal > 0; margin-bottom: 5px;">
              <div style="width: 60%;">Add Running: ${'$' + decoration.runningPrice}</div>
              <div style="width: 20%;">&nbsp;</div>
              <div style="width: 20%;">&nbsp;</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px;">
              <div style="width: 60%;">Colors: ${decoration.colors}</div>
              <div style="width: 20%;">&nbsp;</div>
              <div style="width: 20%;">&nbsp;</div>
            </div>`;

        }
        tableHTML += `</div>`;
        if (quote.royaltyPrice > 0) {
          tableHTML += `<div style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #555;">
            <div style="width: 60%;">${quote.royaltyName}</div>
            <div style="width: 20%;">&nbsp;</div>
            <div style="width: 20%;">${'$' + quote.royaltyPrice}</div>
          </div>
        </div>`;
        }
        if (quote.shippingGroundPrice > 0) {
          tableHTML += `<div style="margin-top: 20px;">
          <div style="margin-top: 20px;" >
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #555;">
            <div style="width: 60%;">Shipping</div>
            <div style="width: 20%;">&nbsp;</div>
            <div style="width: 20%;">${'$' + quote.shippingGroundPrice}</div>
          </div>
        </div>`;
        }
        tableHTML += `
              <!-- SubTotal -->
              <div style="margin-top: 20px; margin-bottom: 20px; border-bottom: 1px solid #000;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #555;">
                  <div style="width: 60%;">SubTotal</div>
                  <div style="width: 20%;">&nbsp;</div>
                  <div style="width: 20%;">${'$' + quote.subTotal.toFixed(2)}</div>
                </div>
              </div>
              <div style="margin-top: 20px; border-bottom: 1px solid #000; padding-bottom: 20px;">`;

        for (let i = 0; i < quote.artworkFiles.length; i++) {
          const file = quote.artworkFiles[i];
          tableHTML += `<a href="${environment.assetsURL}artwork/temp/${quote.pk_cartID}/${quote.pk_cartLineID}/${file.imprintID}/${file.FILENAME}" target="_blank">View Artwork File #${i + 1}</a><br />`;
        }

        if (quote.artworkFiles.length === 0) {
          tableHTML += `<div style="color: #007bff; margin-top: 10px;">No artwork attached to this item.</div>`;
        }

        tableHTML += `</div>
            </div>
          </td>
        </tr>`;
      }

      tableHTML += `</tbody>
      </table>
      <div style="margin: 10px; padding: 10px; text-align: right; background-color: #eee; font-weight: bold;">
        <p>Items Total: ${'$' + this.emailModalContent.totalPrice.toFixed(2)}</p>
      </div>
      <div style="margin: 10px;">
        <p>If there is anything else I can help you with at this time, please don't hesitate to reach out. Thank you for your order, and I look forward to working with you again soon.</p>
      </div>`;
    }


    return tableHTML;
  }
  openSampleCommentModal(item) {
    this.sampleCommentModalData = item;
    $(this.sampleCommentModal.nativeElement).modal('show');
  }

}
