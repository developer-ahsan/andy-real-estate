import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';

@Component({
  selector: 'app-orders-summary',
  templateUrl: './orders-summary.component.html'
})
export class OrdersSummaryComponent implements OnInit {
  @Input() selectedOrder: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  not_available: string = 'N/A';
  not_available_price: string = '0';
  htmlComment: string = '';

  orderSummary: any;
  orderSummaryDetail: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    // Get the order
    this.getOrderSummary();
  }
  getOrderSummary() {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        if (res["data"]) {
          this.htmlComment = res["data"][0]["internalComments"];
          this.orderSummaryDetail = res["data"][0];
        }
        setTimeout(() => {
          this.isLoading = false;
          this.isLoadingChange.emit(false);
          this._changeDetectorRef.markForCheck();
        }, 100);
      }
    })
  }

}
