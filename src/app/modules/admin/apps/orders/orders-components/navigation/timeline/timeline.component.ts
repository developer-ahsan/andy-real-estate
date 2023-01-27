import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';
import moment from 'moment';
interface Transaction {
  item: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html'
})
export class TimelineComponent implements OnInit {
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading: boolean = false;
  selectedOrder: any;

  displayedColumns: string[] = ['item', 'min', 'max'];
  transactions: Transaction[] = [
    { item: 'ARTWORK', min: 2, max: 4 },
    { item: 'PRODUCTION', min: 0, max: 0 },
    { item: 'SHIPPING', min: 3, max: 3 },
    { item: 'Total (bussiness days)', min: 4, max: 4 },
    { item: 'Total (calender days)', min: 4, max: 4 },
  ];
  orderProducts: any;

  dateFrom: any;
  dateTo: any;
  constructor(
    private _orderService: OrdersService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let value = [];
      res["data"].forEach((element, index) => {
        value.push(element.pk_orderLineID);
        if (index == res["data"].length - 1) {
          this.getLineProducts(value.toString());
        }
      });
      this.orderProducts = res["data"];
    })
  }

  getTotalMin() {
    this.transactions[3].min = this.transactions[0].min + this.transactions[1].min + this.transactions[2].min;
    this.transactions[4].min = Math.ceil(this.transactions[3].min * 1.4);
    this.dateFrom = moment(new Date()).add('days', this.transactions[4].min).format("dddd, MMMM Do YYYY");
  }

  getTotalMax() {
    this.transactions[3].max = this.transactions[0].max + this.transactions[1].max + this.transactions[2].max;
    this.transactions[4].max = Math.ceil(this.transactions[3].max * 1.4);
    this.dateTo = moment(new Date()).add('days', this.transactions[4].max).format("dddd, MMMM Do YYYY");
  }

  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.getProductImprints(value, res["data"]);
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
  getProductImprints(value, data) {
    let params = {
      imprint_report: true,
      order_line_id: value
    }
    this._orderService.getOrder(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      let tempArr = [];
      data.forEach(element => {
        let item = [];
        if (res["data"].length == 0) {
          this.transactions[0].min = 0;
          this.transactions[0].max = 0;
          const index = tempArr.findIndex(prod => prod.product.pk_productID == element.pk_productID);
          if (index < 0) {
            if (element.prodTimeMin > this.transactions[1].min) {
              this.transactions[1].min = element.prodTimeMin;
              this.transactions[1].max = element.prodTimeMax;
            }
            tempArr.push({ product: element, imprints: item });
          }
        }
        res["data"].forEach(item => {
          if (item.fk_orderLineID == element.fk_orderLineID) {
            const index = tempArr.findIndex(prod => prod.product.pk_productID == element.pk_productID);
            if (index < 0) {
              if (element.prodTimeMin > this.transactions[1].min) {
                this.transactions[1].min = element.prodTimeMin;
                this.transactions[1].max = element.prodTimeMax;
              }
              tempArr.push({ product: element, imprints: item });
            }
          }
        });
      });
      this.orderProducts = tempArr;
      this.getTotalMin();
      this.getTotalMax();
      // this.getProductTotal();
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLoading = false;
      this.isLoadingChange.emit(false);
      this._changeDetectorRef.markForCheck();
    })
  }
}
