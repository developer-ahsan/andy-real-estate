import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService } from '../../orders.service';

@Component({
  selector: 'app-order-reorder-email',
  templateUrl: './order-reorder-email.component.html',
  styles: ['::-webkit-scrollbar {width: 2px !important}']
})
export class OrderReorderEmailComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean;
  @Input() selectedOrder: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  orderDetail: any;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this._orderService.orderDetail$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.orderDetail = res["data"][0];
      console.log(res["data"])
    })
    setTimeout(() => {
      this.isLoading = true;
      this.isLoadingChange.emit(false);
    }, 100);
  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
