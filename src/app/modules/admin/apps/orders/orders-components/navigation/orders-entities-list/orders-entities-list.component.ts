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
  @Input() selectedOrder: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  not_available: string = 'N/A';

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {

    // Get the order
    this.isLoadingChange.emit(false);
  }

}
