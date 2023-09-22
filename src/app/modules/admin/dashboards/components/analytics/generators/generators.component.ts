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
      let getQuotes = res["data"][0][0].getQuotes;
      let getSampleOrders = res["data"][1][0].getQuotes;
      // let stillProcessingOrders = res["data"][4][0].stillProcessingOrders;
      console.log(res)
      // getQuotes
      if (getQuotes) {
        const quotes = getQuotes.split(',,');
        quotes.forEach(quote => {
          const [cartID, cartDate, inHandsDate, storeID, blnReorder, storeUserID, price, tax, firstName, lastName, phone, companyName, locationName, storeCode, storeName, followUp, priority] = quote.split('::');
          this.pendingQuotes.push({
            cartID: Number(cartID), cartDate, blnReorder: Number(blnReorder), inHandsDate, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, followUp, price: Number(price), tax: Number(tax), phone, priority
          })
        });
      }
      // getSampleOrders
      if (getSampleOrders) {
        const samples = getSampleOrders.split(',,');
        samples.forEach(sample => {
          const [orderID, cost, firstName, lastName, companyName, locationName, orderDate, storeCode, storeName, storeID, storeUserID, blnSampleConverted, sampleComment, days, priority] = sample.split('::');
          this.sampleStatus.push({
            orderID: Number(orderID), orderDate, storeCode, storeName, storeUserID: Number(storeUserID), storeID: Number(storeID), firstName, lastName, locationName, companyName, blnSampleConverted, cost: Number(cost), days, priority, sampleComment
          })
        });
      }
      this._changeDetectorRef.markForCheck();
    })
  }
  trackByCartId(index: number, item: any): any {
    return index;
  }
}
