import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardsService } from '../../../dashboard.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
    this.getOrdersStatus();
  }
  getOrdersStatus() {
    this.pendingQuotes = [];
    this.tempPendingQuotes = [];
    this.pendingStores = [];
    this.sampleStatus = [];
    this.tempSampleStatus = [];
    this.sampleStores = [];
    this.ordersThisYear = [];
    this.tempOrdersThisYear = [];
    this.orderStores = [];
    this.keywordsData = [];
    this.activityData = [];
    this.tempActivityData = [];
    this.activityStores = [];
    let params = {
      generator_reports: true,
      email: this.userData.email,
    }
    this._dashboardService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.ordersThisYear = res["data"][2];
      this.ordersThisYear.forEach(element => {
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
      this.activityData = res["data"][4];
      this.activityData.forEach(element => {
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
      this.processQuotes(res);
      this.processSampleOrders(res);
      this.processKeywords(res);

      this._changeDetectorRef.markForCheck();
    })
  }
  private processQuotes(res: any): void {
    const getQuotes = res?.data?.[0]?.[0]?.getQuotes || '';
    const quotes = getQuotes.split(',,');
    this.pendingQuotes = quotes.map(quote => {
      const [
        cartID, cartDate, inHandsDate, storeID, blnReorder,
        storeUserID, price, tax, firstName, lastName,
        phone, companyName, locationName, storeCode, storeName,
        followUp, priority
      ] = quote.split('::');

      let priorityChecked = false;
      if (Number(priority) > 0) {
        priorityChecked = true;
      }

      const existingStoreIndex = this.pendingStores.findIndex(store => store.store === storeName);

      if (existingStoreIndex > -1) {
        // Store already exists, add data to existing store
        this.pendingStores[existingStoreIndex].data.push({
          cartID: Number(cartID),
          cartDate,
          blnReorder: Number(blnReorder),
          inHandsDate,
          storeCode,
          storeName,
          storeUserID: Number(storeUserID),
          storeID: Number(storeID),
          firstName,
          lastName,
          locationName,
          companyName,
          followUp,
          price: Number(price),
          tax: Number(tax),
          phone,
          priority,
          priorityChecked
        });
      } else {
        // Store does not exist, add a new store
        this.pendingStores.push({
          store: storeName,
          data: [{
            cartID: Number(cartID),
            cartDate,
            blnReorder: Number(blnReorder),
            inHandsDate,
            storeCode,
            storeName,
            storeUserID: Number(storeUserID),
            storeID: Number(storeID),
            firstName,
            lastName,
            locationName,
            companyName,
            followUp,
            price: Number(price),
            tax: Number(tax),
            phone,
            priority,
            priorityChecked
          }]
        });
      }

      return {
        cartID: Number(cartID),
        cartDate,
        blnReorder: Number(blnReorder),
        inHandsDate,
        storeCode,
        storeName,
        storeUserID: Number(storeUserID),
        storeID: Number(storeID),
        firstName,
        lastName,
        locationName,
        companyName,
        followUp,
        price: Number(price),
        tax: Number(tax),
        phone,
        priority,
        priorityChecked
      };
    });
    this.tempPendingQuotes = this.pendingQuotes;
  }

  private processSampleOrders(res: any): void {
    const getSampleOrders = res?.data?.[1]?.[0]?.getSampleOrders || '';
    const samples = getSampleOrders.split(',,');
    this.sampleStatus = samples.map(sample => {
      const [
        orderID, cost, firstName, lastName, companyName,
        locationName, orderDate, storeCode, storeName,
        storeID, storeUserID, blnSampleConverted, sampleComment,
        days, priority
      ] = sample.split('::');
      let priorityChecked = false;
      if (Number(priority) > 0) {
        priorityChecked = true;
      }
      const existingStoreIndex = this.sampleStores.findIndex(store => store.store === storeName);

      if (existingStoreIndex > -1) {
        // Store already exists, add data to existing store
        this.sampleStores[existingStoreIndex].data.push({
          orderID: Number(orderID), orderDate, storeCode, storeName,
          storeUserID: Number(storeUserID), storeID: Number(storeID),
          firstName, lastName, locationName, companyName, blnSampleConverted,
          cost: Number(cost), days, priority, sampleComment, priorityChecked
        });
      } else {
        // Store does not exist, add a new store
        this.sampleStores.push({
          store: storeName,
          data: [{
            orderID: Number(orderID), orderDate, storeCode, storeName,
            storeUserID: Number(storeUserID), storeID: Number(storeID),
            firstName, lastName, locationName, companyName, blnSampleConverted,
            cost: Number(cost), days, priority, sampleComment, priorityChecked
          }]
        });
      }
      return {
        orderID: Number(orderID), orderDate, storeCode, storeName,
        storeUserID: Number(storeUserID), storeID: Number(storeID),
        firstName, lastName, locationName, companyName, blnSampleConverted,
        cost: Number(cost), days, priority, sampleComment, priorityChecked
      };
    });
    this.tempSampleStatus = this.sampleStatus;
  }

  private processKeywords(res: any): void {
    this.keywordsData = res?.data?.[3];
    // const getKeywords = res?.data?.[3]?.[0]?.keywords || '';
    // const samples = getKeywords.split(',,');
    // this.keywordsData = samples.map(sample => {
    //   const [storeCode, storeName, protocol, keyword, frequency, result, days] = sample.split('::');
    //   return { storeCode, storeName, protocol, keyword, frequency, result, days };
    // });
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
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { });
  }
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
    const { orderID, storeUserID } = order;
    let payload = {
      orderID: orderID,
      pk_userID: storeUserID,
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
          this.sampleStatus = this.sampleStatus.filter(item => item.orderID != orderID);
        } else if (type == 'blnCustomerLastYear') {
          this.ordersThisYear = this.ordersThisYear.filter(item => item.orderID != orderID);
        } else if (type == 'blnFollowUp') {
          this.activityData = this.activityData.filter(item => item.orderID != orderID);
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
      } else {
        const index = this.sampleStores.findIndex(store => store.store == event.value);
        this.sampleStatus = this.sampleStores[index].data;
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
  getOrderArtworkDetails() {
    let params = {
      quote_artwork_details: true,
      cart_id: this.orderDetailsModalContent.cartID
    }
    this._dashboardService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.orderDetailsModalContent.loader = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      res["data"].forEach(element => {
        element.imprints = []
        if (element.imprintDetails) {
          let imprints = element.imprintDetails.split('#_');
          imprints.forEach(imprint => {
            const [location, method, id, status, approver] = imprint.split('||');
            element.imprints.push({ location, method, status, id, approver })
          });
        }
      });
      this.orderDetailsModalContent.artworkData = res["data"];
    });
  }
  trackByCartId(index: number, item: any): any {
    return index;
  }
  openEmailDetailsModal(data, type) {
    console.log(data);
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
      case 'quotes':
        payload = {
          cartID: this.emailModalContent.cartID,
          storeID: this.emailModalContent.storeID,
          storeUserID: this.emailModalContent.storeUserID,
          get_quote_email_data: true
        };
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
                <img class="w-50" src="${environment.assetsURL}globalAssets/Stores/mastheads/${this.emailModalContent.fk_storeID}.gif" />
              </div>
            </div>`
        }
      }
      if (type != 'quotes') {
        if (res["qryOrderLines"].length) {
          res["qryOrderLines"].forEach(element => {
            const virtualProofPath = `/globalAssets/StoreUsers/VirtualProofs/${res["orderData"][0].storeUser_pk_userID}/${this.emailModalContent.orderID}/${element.pk_orderLineID}`;
            this.getFilesFromPath(virtualProofPath).then((proofs: any) => {
              if (proofs) {
                if (proofs.length) {
                  element.imageUrl = environment.assetsURL + `/globalAssets/StoreUsers/VirtualProofs/${res["orderData"][0].storeUser_pk_userID}/${this.emailModalContent.orderID}/${element.pk_orderLineID}/${element.VirtualProofsData[0].FILENAME}?${Date.now().toString()}`;
                } else {
                  const imageURL = `${environment.assetsURL}/globalAssets/Products/HiRes/${element.storeProductID}.jpg?${Date.now().toString()}`;
                  this.checkIfImageExists(imageURL).then(image => {
                    if (image) {
                      element.imageUrl = imageURL;
                    } else {
                      element.imageUrl = `assets/images/coming_soon.jpg`;
                    }
                    this._changeDetectorRef.markForCheck();
                  });
                }
              }
            });
            if (type == 'reorder') {
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
      } else {
        this.emailModalContent.totalPrice = 0;
        res["cartData"].forEach(carts => {
          carts.artworkFiles = [];
          carts.subTotal = Number(carts.royaltyPrice) + Number(carts.shippingGroundPrice);
          // Colors Data
          carts.ColorsData = (carts.Colors || '').split('#_').map(color => {
            const [colorName, unitPrice, totalPrice, sizeName] = color.split('||');
            carts.subTotal += Number(totalPrice);
            return { colorName: colorName + ' & ' + sizeName, unitPrice: Number(unitPrice), totalPrice: Number(totalPrice) };
          });
          // Decorations Data
          carts.DecorationData = (carts.Decoration || '').split('#_').map(decoration => {
            const [id, locationName, methodName, price, setupPrice, colors, logoID, runningPrice] = decoration.split('||');
            carts.subTotal += Number(price);
            this.getArworkFiles(carts, id);
            return { locationName, methodName, price: Number(price), setupPrice: Number(setupPrice), colors, runningPrice: Number(runningPrice) };
          });
          this.emailModalContent.totalPrice += carts.subTotal;
        });
        this.emailModalContent.cartData = res["cartData"];
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
  getArworkFiles(data, imprintID) {
    let payload = {
      files_fetch: true,
      path: `/artwork/temp/${data.pk_cartID}/${data.pk_cartLineID}/${imprintID}/`
    }
    this._changeDetectorRef.markForCheck();
    this._dashboardService.getFiles(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(files => {
      files["data"].forEach(file => {
        file.imprintID = imprintID;
        data.artworkFiles.push(file);
      });
      this._changeDetectorRef.markForCheck();
    }, err => {
      this._changeDetectorRef.markForCheck();
    });
  }
}
