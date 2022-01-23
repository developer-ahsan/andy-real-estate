import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrdersService } from 'app/modules/admin/apps/orders/orders-components/orders.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { OrdersList } from 'app/modules/admin/apps/orders/orders-components/orders.types';

@Component({
  selector: 'app-orders-entities-list',
  templateUrl: './orders-entities-list.component.html'
})
export class OrdersEntitiesListComponent implements OnInit {
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selectedOrder: OrdersList = null;
  not_available: string = 'N/A';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {

    // Get the order
    this._orderService.orders$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((orders: OrdersList[]) => {
        this.selectedOrder = orders["data"].find(x => x.pk_orderID == location.pathname.split('/')[3]);

        // Mark for check
        this._changeDetectorRef.markForCheck();
        // this.isLoadingChange.emit(false);
      });
  }

}
