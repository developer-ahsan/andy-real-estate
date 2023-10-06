import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DashboardsService } from '../../../dashboard.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-order-generators',
  templateUrl: './generators.component.html',
  styleUrls: ['./generators.component.scss']
})
export class GeneratorsComponent implements OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

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
  constructor(private _changeDetectorRef: ChangeDetectorRef,
    private _dashboardService: DashboardsService,
  ) { }

  ngOnInit(): void {
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

  trackByCartId(index: number, item: any): any {
    return index;
  }
}
