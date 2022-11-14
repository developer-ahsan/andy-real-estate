import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';

@Component({
  selector: 'app-order-survey',
  templateUrl: './order-survey.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderSurveyComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;
  surveys: any;

  isSurveyLoader: boolean = false;
  surveyDetail: any;
  step = 0;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
    })
    this.isLoading = true;
    this.getSurveys();
  };
  getSurveys() {
    let params = {
      order_surveys: true,
      order_id: this.selectedOrder.pk_orderID,
      store_id: this.selectedOrder.pk_storeID
    }
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.surveys = res["data"];
      if (this.surveys.length > 0) {
        this.getSurveysDetail(this.surveys[0].pk_surveyID);
      }
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  getSurveysDetail(surveId) {
    let params = {
      surveys_qa: true,
      order_id: this.selectedOrder.pk_orderID,
      survey_id: surveId
    }
    this.isSurveyLoader = true;
    this._orderService.getOrderCommonCall(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.surveyDetail = res["data"];
      console.log(this.surveyDetail)
      this.isSurveyLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isSurveyLoader = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    });
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
