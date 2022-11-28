import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';

interface Transaction {
  item: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-order-payments',
  templateUrl: './order-payments.component.html'
})
export class OrderPaymentComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() selectedOrder: any;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  orderDetail: any;
  not_available_price: string = '0';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.getOrderDetail();
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingChange.emit(false)
    }, 10);
  }
  getOrderDetail() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
    });
  }
}
