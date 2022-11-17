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
  productsList = [];
  supplierList = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _orderService: OrdersService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._orderService.orderLineProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (!res) {
        this._orderService.orderProducts$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          let value = [];
          res["data"].forEach((element, index) => {
            value.push(element.pk_orderLineID);
            if (index == res["data"].length - 1) {
              this.getLineProducts(value.toString());
            }
          });
        })
      } else {
        res["data"].forEach(element => {
          const proIndex = this.productsList.findIndex(item => item.id == element.pk_productID);
          if (proIndex < 0) {
            this.productsList.push({ name: element.productName, id: element.pk_productID });
          }
          const index = this.supplierList.findIndex(item => item.id == element.supplier_id);
          if (index < 0) {
            this.supplierList.push({ name: element.supplier_name, id: element.supplier_id, link: element.supplierLink });
          }
        });
        this.isLoading = false;
        this.isLoadingChange.emit(false);
        this._changeDetectorRef.markForCheck();
      }
    })
    // Get the order
  }
  getLineProducts(value) {
    let params = {
      order_line_item: true,
      order_line_id: value
    }
    this._orderService.getOrderLineProducts(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {

      // res["data"].forEach(element => {
      //   this.productsList.push({ name: element.productName, id: element.pk_productID });
      //   const index = this.supplierList.findIndex(item => item.id == element.supplier_id);
      //   if (index < 0) {
      //     this.supplierList.push({ name: element.supplier_name, id: element.supplier_id, link: element.supplierLink });
      //   }
      // });
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
