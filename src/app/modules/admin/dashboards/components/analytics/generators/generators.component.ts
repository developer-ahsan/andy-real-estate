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
  sampleStatus: any = [];
  ordersThisYear: any = [];
  keywordsData: any = [];
  activityData: any = [];
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
    this.sampleStatus = [];
    this.ordersThisYear = [];
    this.keywordsData = [];
    this.activityData = [];
    let params = {
      generator_reports: true,
      email: this.userData.email,
    }
    this._dashboardService.getDashboardData(params).pipe(takeUntil(this._unsubscribeAll), finalize(() => {
      this.isLoading = false;
      this._changeDetectorRef.markForCheck();
    })).subscribe(res => {
      this.ordersThisYear = res["data"][2];
      this.activityData = res["data"][4];
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
      return {
        cartID: Number(cartID), cartDate, blnReorder: Number(blnReorder),
        inHandsDate, storeCode, storeName, storeUserID: Number(storeUserID),
        storeID: Number(storeID), firstName, lastName, locationName, companyName,
        followUp, price: Number(price), tax: Number(tax), phone, priority, priorityChecked
      };
    });
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
      return {
        orderID: Number(orderID), orderDate, storeCode, storeName,
        storeUserID: Number(storeUserID), storeID: Number(storeID),
        firstName, lastName, locationName, companyName, blnSampleConverted,
        cost: Number(cost), days, priority, sampleComment, priorityChecked
      };
    });
  }

  private processKeywords(res: any): void {
    const getKeywords = res?.data?.[3]?.[0]?.keywords || '';
    const samples = getKeywords.split(',,');
    this.keywordsData = samples.map(sample => {
      const [storeCode, storeName, protocol, keyword, frequency, result, days] = sample.split('::');
      return { storeCode, storeName, protocol, keyword, frequency, result, days };
    });
  }
  // Update Priority
  updatePriority(quote, type) {
    const { orderID, priorityChecked } = quote;
    let payload: any;
    // if (priorityChecked) {
    //   payload = {
    //     cartID: number;

    // dashboardType: string;

    // add_quote_mark_priority: boolean;
    //   }
    // } else {
    //   payload = {
    //     cartID: number;

    // dashboardType: string;

    // delete_quote_mark_priority: boolean;
    //   }
    // }
    this._dashboardService.updateDashboardData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => { });
  }
  trackByCartId(index: number, item: any): any {
    return index;
  }
}
